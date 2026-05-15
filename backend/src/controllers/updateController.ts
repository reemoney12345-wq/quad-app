import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

const createUpdateSchema = z.object({
  category: z.enum(['Crowd', 'WiFi', 'Queue', 'Other']),
  location: z.string().min(1),
  message: z.string().min(1),
});

export const getUpdates = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }

    const updates = await prisma.campusUpdate.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Transform to match frontend format
    const transformed = updates.map(update => ({
      id: update.id,
      author: update.user.name,
      category: update.category,
      location: update.location,
      message: update.message,
      minutesAgo: Math.floor((Date.now() - update.createdAt.getTime()) / 60000),
      confirmations: update.confirmations,
    }));

    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
};

export const createUpdate = async (req: AuthRequest, res: Response) => {
  try {
    const { category, location, message } = createUpdateSchema.parse(req.body);

    const update = await prisma.campusUpdate.create({
      data: {
        userId: req.userId!,
        category,
        location,
        message,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    const transformed = {
      id: update.id,
      author: update.user.name,
      category: update.category,
      location: update.location,
      message: update.message,
      minutesAgo: 0,
      confirmations: 0,
    };

    // Emit real-time update
    req.app.get('io')?.emit('update:new', transformed);

    res.status(201).json(transformed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create update' });
  }
};

export const verifyUpdate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user already verified this update
    const existing = await prisma.updateVerification.findUnique({
      where: {
        updateId_userId: {
          updateId: id,
          userId: req.userId!,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Already verified' });
    }

    // Create verification and increment counter
    await prisma.updateVerification.create({
      data: {
        updateId: id,
        userId: req.userId!,
      },
    });

    const update = await prisma.campusUpdate.update({
      where: { id },
      data: { confirmations: { increment: 1 } },
    });

    // Emit verification update
    req.app.get('io')?.emit('update:verified', {
      updateId: id,
      confirmations: update.confirmations,
    });

    res.json({ confirmations: update.confirmations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify update' });
  }
};
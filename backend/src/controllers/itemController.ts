import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import cloudinary from '../config/cloudinary';
import fs from 'fs';

const createItemSchema = z.object({
  type: z.enum(['lost', 'found']),
  name: z.string().min(1),
  location: z.string().min(1),
  date: z.string().min(1),
  reporter: z.string().min(1),
  note: z.string().optional(),
});

export const getItems = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    
    const where: any = {};
    if (type && (type === 'lost' || type === 'found')) {
      where.type = type;
    }

    const items = await prisma.lostFoundItem.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match frontend format
    const transformed = items.map(item => ({
      id: item.id,
      name: item.name,
      location: item.location,
      date: item.date,
      reporter: item.reporter,
      note: item.note,
      image: item.image,
      status: item.status,
    }));

    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    const { type, name, location, date, reporter, note } = createItemSchema.parse(req.body);

    let imageUrl: string | undefined;
    
    // Upload image to Cloudinary if file exists
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'quad-lost-found',
      });
      imageUrl = result.secure_url;
      
      // Delete local file after upload
      fs.unlinkSync(req.file.path);
    }

    const item = await prisma.lostFoundItem.create({
      data: {
        userId: req.userId!,
        type,
        name,
        location,
        date,
        reporter,
        note,
        image: imageUrl,
      },
    });

    res.status(201).json({
      id: item.id,
      name: item.name,
      location: item.location,
      date: item.date,
      reporter: item.reporter,
      note: item.note,
      image: item.image,
      status: item.status,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Failed to create item' });
  }
};

export const claimItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const item = await prisma.lostFoundItem.update({
      where: { id },
      data: { status: 'claimed' },
    });

    res.json({ status: item.status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim item' });
  }
};
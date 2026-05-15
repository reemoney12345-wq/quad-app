import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getRooms = async (req: Request, res: Response) => {
  try {
    const { building, status, minCapacity } = req.query;
    
    const where: any = {};
    
    if (building && building !== 'all') {
      where.building = building as string;
    }
    
    if (status && status !== 'all') {
      where.status = status as string;
    }
    
    if (minCapacity) {
      where.capacity = { gte: parseInt(minCapacity as string) };
    }

    const rooms = await prisma.room.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { name, building, capacity, status, until } = req.body;

    if (!name || !building || !capacity || !status) {
      return res.status(400).json({ error: 'Missing required fields: name, building, capacity, status' });
    }

    const room = await prisma.room.create({
      data: {
        name,
        building,
        capacity: parseInt(capacity) || 0,
        status,
        until: until || null,
      },
    });

    // Emit socket event for real-time update
    const io = (req.app as any).get('io');
    if (io) {
      io.emit('room:status', room);
    }

    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const updateRoomStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, until } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const existingRoom = await prisma.room.findUnique({ where: { id } });
    if (!existingRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        status,
        until: until || null,
      },
    });

    // Emit socket event for real-time update
    const io = (req.app as any).get('io');
    if (io) {
      io.emit('room:status', room);
    }

    res.json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingRoom = await prisma.room.findUnique({ where: { id } });
    if (!existingRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    await prisma.room.delete({ where: { id } });

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
};
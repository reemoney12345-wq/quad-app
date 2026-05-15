import { Request, Response } from 'express';
import prisma from '../config/database';

export const getLocations = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    let locations;
    if (search && typeof search === 'string') {
      locations = await prisma.location.findMany({
        where: {
          OR: [
            { name: { contains: search } },
            { category: { contains: search } },
          ],
        },
      });
    } else {
      locations = await prisma.location.findMany();
    }

    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

export const getLocation = async (req: Request, res: Response) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: req.params.id },
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch location' });
  }
};
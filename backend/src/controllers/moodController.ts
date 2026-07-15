import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const logMood = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { score, tags, note } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const mood = await prisma.mood.create({
      data: {
        userId,
        score,
        tags: tags || [],
        note,
      },
    });

    res.status(201).json({
      success: true,
      mood,
    });
  } catch (error) {
    next(error);
  }
};

export const getMoodLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 30;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const moods = await prisma.mood.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      take: limit,
    });

    res.json({
      success: true,
      moods,
    });
  } catch (error) {
    next(error);
  }
};

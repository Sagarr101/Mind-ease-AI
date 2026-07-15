import { Response, NextFunction } from 'express';
import { MeditationSession } from '../models/Meditation';
import { AuthRequest } from '../middleware/auth';

export const logMeditation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, durationMinutes } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const session = await MeditationSession.create({
      userId,
      title,
      durationMinutes,
    });

    res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

export const getMeditationSessions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const sessions = await MeditationSession.find({ userId }).sort({ completedAt: -1 });

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

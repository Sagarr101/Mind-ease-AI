import { Response, NextFunction } from 'express';
import { Journal } from '../models/Journal';
import { AuthRequest } from '../middleware/auth';
import { classifyLocalSentiment } from '../services/aiService';

export const createJournal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content, moodScore } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Automatically analyze sentiment based on contents
    const sentiment = classifyLocalSentiment(content);

    const journal = await Journal.create({
      userId,
      title,
      content,
      moodScore,
      sentiment,
    });

    res.status(201).json({
      success: true,
      journal,
    });
  } catch (error) {
    next(error);
  }
};

export const getJournals = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const journals = await Journal.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      journals,
    });
  } catch (error) {
    next(error);
  }
};

export const getJournalById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const journal = await Journal.findOne({ _id: id, userId });
    if (!journal) {
      res.status(404).json({ success: false, message: 'Journal entry not found' });
      return;
    }

    res.json({
      success: true,
      journal,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJournal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const journal = await Journal.findOneAndDelete({ _id: id, userId });
    if (!journal) {
      res.status(404).json({ success: false, message: 'Journal entry not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Journal entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

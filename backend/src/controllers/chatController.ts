import { Response, NextFunction } from 'express';
import { ChatMessage } from '../models/ChatMessage';
import { AuthRequest } from '../middleware/auth';

export const getChatHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const messages = await ChatMessage.find({ userId }).sort({ createdAt: 1 });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

export const clearChatHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await ChatMessage.deleteMany({ userId });

    // Seed a baseline starting therapist welcome message
    const welcomeMessage = await ChatMessage.create({
      userId,
      sender: 'therapist',
      content: "Hello! I am MindEase AI, your personal mental wellness guide. How are you feeling today? You can share anything that is on your mind, whether it is anxiety, stress, or something positive.",
      sentiment: 'Neutral',
    });

    res.json({
      success: true,
      message: 'Chat history cleared successfully',
      welcomeMessage,
    });
  } catch (error) {
    next(error);
  }
};

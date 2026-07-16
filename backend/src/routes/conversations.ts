import { Router, Request, Response, NextFunction } from 'express';
import { AuthRequest, protect } from '../middleware/auth';
import chatService from '../services/chatService';
import { Conversation } from '../models/Conversation';
import { ChatMessage } from '../models/ChatMessage';

const router = Router();

router.use(protect);

// Get all conversations for a user
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const conversations = await Conversation.find({ userId: req.user.id }).sort({ lastActivity: -1 }).lean();
    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
});

// Get messages from a specific conversation
router.get('/:conversationId/messages', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { conversationId } = req.params;
    const messages = await ChatMessage.find({ conversationId, userId: req.user.id }).sort({ timestamp: 1 }).lean();

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
});

export default router;

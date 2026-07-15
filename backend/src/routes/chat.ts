import { Router } from 'express';
import { getChatHistory, clearChatHistory } from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

export default router;

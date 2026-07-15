import { Router } from 'express';
import { z } from 'zod';
import { logMood, getMoodLogs } from '../controllers/moodController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const logMoodSchema = z.object({
  body: z.object({
    score: z.number().min(1, 'Score must be at least 1').max(5, 'Score cannot exceed 5'),
    tags: z.array(z.string()).optional(),
    note: z.string().optional(),
  }),
});

router.use(protect);

router.post('/', validate(logMoodSchema), logMood);
router.get('/', getMoodLogs);

export default router;

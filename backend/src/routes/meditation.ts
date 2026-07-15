import { Router } from 'express';
import { z } from 'zod';
import { logMeditation, getMeditationSessions } from '../controllers/meditationController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const logMeditationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Meditation title is required'),
    durationMinutes: z.number().min(1, 'Duration must be at least 1 minute'),
  }),
});

router.use(protect);

router.post('/', validate(logMeditationSchema), logMeditation);
router.get('/', getMeditationSessions);

export default router;

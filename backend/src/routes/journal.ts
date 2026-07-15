import { Router } from 'express';
import { z } from 'zod';
import { createJournal, getJournals, getJournalById, deleteJournal } from '../controllers/journalController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createJournalSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
    content: z.string().min(1, 'Content is required'),
    moodScore: z.number().min(1).max(5).optional(),
  }),
});

router.use(protect);

router.post('/', validate(createJournalSchema), createJournal);
router.get('/', getJournals);
router.get('/:id', getJournalById);
router.delete('/:id', deleteJournal);

export default router;

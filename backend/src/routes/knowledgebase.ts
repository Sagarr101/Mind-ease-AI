import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth';
import ragService from '../services/ragService';
import { KnowledgeBase } from '../models/KnowledgeBase';

const router = Router();

router.use(protect);

// Search knowledge base
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ success: false, message: 'Query parameter required' });
    }

    const results = await ragService.retrieveRelevantChunks(q, 5);
    res.json({ success: true, results });
  } catch (error) {
    next(error);
  }
});

// Get all knowledge base documents
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await KnowledgeBase.find().select('title source createdAt').lean();
    res.json({ success: true, documents: docs });
  } catch (error) {
    next(error);
  }
});

// Get a specific document
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await KnowledgeBase.findById(req.params.id).lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    res.json({ success: true, document: doc });
  } catch (error) {
    next(error);
  }
});

export default router;

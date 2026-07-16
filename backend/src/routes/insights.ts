import { Router, Request, Response, NextFunction } from 'express';
import { AuthRequest, protect } from '../middleware/auth';
import insightsService from '../services/insightsService';
import { logger } from '../utils/logger';

const router = Router();

router.use(protect);

// Get user insights
router.get('/user-insights', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const insights = await insightsService.getUserInsights(req.user.id);
    res.json({ success: true, insights });
  } catch (error) {
    next(error);
  }
});

// Generate weekly insights (admin or scheduled task)
router.post('/generate-weekly', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await insightsService.generateWeeklyInsights(req.user.id);
    res.json({ success: true, message: 'Weekly insights generated' });
  } catch (error) {
    next(error);
  }
});

export default router;

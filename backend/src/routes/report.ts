import { Router } from 'express';
import { getReports, generateReport } from '../controllers/reportController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getReports);
router.post('/generate', generateReport);

export default router;

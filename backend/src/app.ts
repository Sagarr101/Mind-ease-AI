import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';

// Import routers
import authRouter from './routes/auth';
import moodRouter from './routes/mood';
import journalRouter from './routes/journal';
import meditationRouter from './routes/meditation';
import reportRouter from './routes/report';
import notificationRouter from './routes/notification';
import chatRouter from './routes/chat';
import insightsRouter from './routes/insights';
import conversationsRouter from './routes/conversations';
import knowledgebaseRouter from './routes/knowledgebase';

const app = express();

// Security Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Dynamically reflect request origin to prevent CORS blocks in multi-IP/domain deployments
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Mounting routes
app.use('/api/auth', authRouter);
app.use('/api/mood', moodRouter);
app.use('/api/journal', journalRouter);
app.use('/api/meditation', meditationRouter);
app.use('/api/report', reportRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/chat', chatRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/knowledgebase', knowledgebaseRouter);

// Global Error Handler
app.use(errorHandler);

export default app;

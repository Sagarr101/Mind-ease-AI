import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ChatMessage } from '../models/ChatMessage';
import { Conversation } from '../models/Conversation';
import { analyzeSentimentAndRespond, classifyLocalSentiment } from '../services/aiService';
import chatService from '../services/chatService';
import crisisDetectionService from '../services/crisisDetectionService';
import emotionService from '../services/emotionService';
import emotionRepository from '../repositories/emotionRepository';
import { logger } from '../utils/logger';

interface SocketData {
  userId: string;
  username: string;
  conversationId?: string;
}

export const initSocket = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: (origin: any, callback: any) => {
        // Dynamically reflect request origin to prevent CORS blocks in multi-IP/domain socket connections
        callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware for Sockets
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: Token is required'));
      }

      const secret = process.env.JWT_SECRET || 'mindease_development_jwt_secret_token_12345';
      const decoded = jwt.verify(token, secret) as { id: string };

      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user details to socket data context
      socket.data = {
        userId: user._id.toString(),
        username: user.username,
        conversationId: undefined,
      };

      next();
    } catch (err) {
      logger.error('Socket authentication failed:', err);
      return next(new Error('Authentication error: Invalid credentials'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    let { userId, username } = socket.data as SocketData;
    logger.info(`[Socket] User connected: ${username} (ID: ${userId})`);

    // Create or retrieve the default conversation for this user
    let conversationId = socket.data.conversationId;
    if (!conversationId) {
      const existing = await Conversation.findOne({ userId }).lean();
      if (existing) {
        conversationId = existing._id.toString();
      } else {
        const created = await Conversation.create({ userId, title: 'Default Chat', participants: [userId] });
        conversationId = created._id.toString();
      }
      socket.data.conversationId = conversationId;
    }

    // Join a private room unique to this user
    socket.join(userId);

    // Handle incoming messages
    socket.on('send_message', async (data: { content: string }) => {
      try {
        const { content } = data;
        if (!content || content.trim() === '') return;

        logger.info(`[Socket] Message from ${username}: "${content}"`);

        // 1. Detect emotions in user input
        const emotionResult = emotionService.detectEmotions(content);
        
        // Store emotion record for analytics
        await emotionRepository.addEmotionRecord({
          userId,
          detectedAt: new Date(),
          dominantEmotion: emotionResult.dominant,
          confidence: emotionResult.confidence,
          distribution: emotionResult.distribution,
        });

        // 2. Check for crisis content before responding
        const crisisCheck = await crisisDetectionService.detectAndRespond(userId, content);
        if (crisisCheck.isCrisis) {
          // Save user message
          await chatService.saveUserMessage(userId, conversationId, content, {
            sentiment: 'Crisis',
            emotions: emotionResult.distribution,
          });
          
          const userMsg = await ChatMessage.findOne({ userId, conversationId, sender: 'user', content }).lean();
          io.to(userId).emit('new_message', userMsg);

          // Send crisis response
          io.to(userId).emit('crisis_alert', {
            compassionateMessage: crisisCheck.compassionateReply,
            resources: crisisCheck.resources,
          });
          return;
        }

        // 3. Save user message with conversation ID and emotion metadata
        const userSentiment = classifyLocalSentiment(content);
        await chatService.saveUserMessage(userId, conversationId, content, {
          sentiment: userSentiment,
          emotions: emotionResult.distribution,
        });
        
        const userMsg = await ChatMessage.findOne({ userId, conversationId, sender: 'user', content }).lean();

        // 4. Broadcast user message back to user's screen
        io.to(userId).emit('new_message', userMsg);

        // 5. Trigger typing status for a realistic therapist feel
        io.to(userId).emit('typing_start');

        // 6. Build context from conversation history and query AI with long-term memory
        const { reply, sentiment } = await analyzeSentimentAndRespond(userId, conversationId, content);

        // 7. Artificial typing lag (1.2 seconds) to display typing visualizer
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // 8. Save AI therapist response with conversation ID and emotion analysis
        const responseEmotions = emotionService.detectEmotions(reply);
        await chatService.saveAssistantMessage(userId, conversationId, reply, {
          sentiment,
          emotions: responseEmotions.distribution,
        });
        
        const therapistMsg = await ChatMessage.findOne({ userId, conversationId, sender: 'assistant', content: reply }).lean();

        // 9. Stop typing state and broadcast therapist message
        io.to(userId).emit('typing_stop');
        io.to(userId).emit('new_message', therapistMsg);

      } catch (error) {
        logger.error('[Socket] Error processing send_message event:', error);
        socket.emit('error', { message: 'Failed to process message' });
        io.to(userId).emit('typing_stop');
      }
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket] User disconnected: ${username}`);
    });
  });

  return io;
};
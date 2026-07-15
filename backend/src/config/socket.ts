import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ChatMessage } from '../models/ChatMessage';
import { analyzeSentimentAndRespond, classifyLocalSentiment } from '../services/aiService';

interface SocketData {
  userId: string;
  username: string;
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
      };

      next();
    } catch (err) {
      console.error('Socket authentication failed:', err);
      return next(new Error('Authentication error: Invalid credentials'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const { userId, username } = socket.data as SocketData;
    console.log(`[Socket] User connected: ${username} (ID: ${userId})`);

    // Join a private room unique to this user
    socket.join(userId);

    // Handle incoming messages
    socket.on('send_message', async (data: { content: string }) => {
      try {
        const { content } = data;
        if (!content || content.trim() === '') return;

        console.log(`[Socket] Message from ${username}: "${content}"`);

        // 1. Process user message
        const userSentiment = classifyLocalSentiment(content);
        const userMsg = await ChatMessage.create({
          userId,
          sender: 'user',
          content,
          sentiment: userSentiment,
        });

        // 2. Broadcast user message back to user's screen
        io.to(userId).emit('new_message', userMsg);

        // 3. Trigger typing status for a realistic therapist feel
        io.to(userId).emit('typing_start');

        // 4. Query AI service (which falls back locally if no API keys)
        const { reply, sentiment } = await analyzeSentimentAndRespond(userId, content);

        // 5. Artificial typing lag (1.2 seconds) to display typing visualizer
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // 6. Save AI therapist response
        const therapistMsg = await ChatMessage.create({
          userId,
          sender: 'therapist',
          content: reply,
          sentiment,
        });

        // 7. Stop typing state and broadcast therapist message
        io.to(userId).emit('typing_stop');
        io.to(userId).emit('new_message', therapistMsg);

      } catch (error) {
        console.error('[Socket] Error processing send_message event:', error);
        socket.emit('error', { message: 'Failed to process message' });
        io.to(userId).emit('typing_stop');
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${username}`);
    });
  });

  return io;
};

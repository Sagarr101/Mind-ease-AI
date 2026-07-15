import { createServer } from 'http';
import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/db';
import { initSocket } from './config/socket';

// Load Environment Variables
dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Create HTTP Server wrapping the Express app
  const server = createServer(app);

  // Initialize Socket.io Server
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀 MindEase Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer().catch((error) => {
  console.error('Fatal error starting the server:', error);
  process.exit(1);
});

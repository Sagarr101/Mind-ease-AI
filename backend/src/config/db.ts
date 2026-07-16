import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';

export const prisma = new PrismaClient();

export const connectDB = async (): Promise<void> => {
  try {
    // Connect to PostgreSQL with Prisma
    await prisma.$connect();
    console.log('✓ PostgreSQL (Prisma) Connected successfully');

    // Connect to MongoDB with Mongoose
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindease';
    await mongoose.connect(mongoUrl, {
      retryWrites: true,
      w: 'majority',
    });
    console.log('✓ MongoDB (Mongoose) Connected successfully');
  } catch (error) {
    console.error('Error connecting to databases:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  await mongoose.disconnect();
  process.exit(0);
});

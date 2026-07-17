import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'streak' | 'report' | 'system';
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['streak', 'report', 'system'],
    default: 'system',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster lookups by user
NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', NotificationSchema);
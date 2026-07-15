import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  read: boolean;
  type: 'streak' | 'report' | 'system';
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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

export const Notification = model<INotification>('Notification', NotificationSchema);

import { Schema, model, Document } from 'mongoose';

export interface IMessageModel extends Document {
  userId: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sentiment?: string;
  emotions?: Record<string, number>;
}

const MessageSchema = new Schema<IMessageModel>(
  {
    userId: { type: String, required: true, index: true },
    conversationId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    sentiment: { type: String },
    emotions: { type: Object },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, timestamp: 1 });

export const Message = model<IMessageModel>('Message', MessageSchema);
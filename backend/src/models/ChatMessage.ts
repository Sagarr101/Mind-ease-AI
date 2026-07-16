import { Schema, model, Document } from 'mongoose';

export interface IChatMessage extends Document {
  userId: string;
  conversationId?: string | null;
  sender: 'user' | 'therapist';
  content: string;
  sentiment?: string;
  emotions?: Record<string, number>;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  sender: {
    type: String,
    enum: ['user', 'therapist'],
    required: true,
  },
  conversationId: {
    type: String,
    default: null,
    index: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  sentiment: {
    type: String,
    default: 'Neutral',
  },
  emotions: {
    type: Object,
    default: undefined,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Optimize searching message history by indexing userId and createdAt together
ChatMessageSchema.index({ userId: 1, createdAt: 1 });

export const ChatMessage = model<IChatMessage>('ChatMessage', ChatMessageSchema);
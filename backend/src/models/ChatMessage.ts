import { Schema, model, Document, Types } from 'mongoose';

export interface IChatMessage extends Document {
  userId: Types.ObjectId;
  sender: 'user' | 'therapist';
  content: string;
  sentiment?: string; // Captured sentiment tag (e.g. anxious, sad, neutral)
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: String,
    enum: ['user', 'therapist'],
    required: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Optimize searching message history by indexing userId and createdAt together
ChatMessageSchema.index({ userId: 1, createdAt: 1 });

export const ChatMessage = model<IChatMessage>('ChatMessage', ChatMessageSchema);

import { Schema, model, Document } from 'mongoose';

export interface IConversationModel extends Document {
  userId: string;
  title?: string;
  participants: string[];
  lastActivity?: Date;
}

const ConversationSchema = new Schema<IConversationModel>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String },
    participants: { type: [String], default: [] },
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Conversation = model<IConversationModel>('Conversation', ConversationSchema);

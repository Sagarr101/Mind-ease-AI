import { Schema, model, Document, Types } from 'mongoose';

export interface IKnowledgeDoc extends Document {
  title: string;
  source?: string;
  content: string;
  chunks?: { text: string; embeddingRef?: string }[];
  createdAt: Date;
}

const KnowledgeBaseSchema = new Schema<IKnowledgeDoc>(
  {
    title: { type: String, required: true, index: true },
    source: { type: String },
    content: { type: String, required: true },
    chunks: { type: [Object], default: [] },
  },
  { timestamps: true }
);

KnowledgeBaseSchema.index({ title: 'text', content: 'text' });

export const KnowledgeBase = model<IKnowledgeDoc>('KnowledgeBase', KnowledgeBaseSchema);

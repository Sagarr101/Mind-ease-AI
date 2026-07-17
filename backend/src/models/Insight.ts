import { Schema, model, Document } from 'mongoose';

export interface IInsight extends Document {
  userId: string;
  title: string;
  description: string;
  metric?: string;
  value?: any;
  generatedAt: Date;
}

const InsightSchema = new Schema<IInsight>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    metric: { type: String },
    value: { type: Schema.Types.Mixed },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

InsightSchema.index({ userId: 1, generatedAt: -1 });

export const Insight = model<IInsight>('Insight', InsightSchema);
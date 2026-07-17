import { Schema, model, Document } from 'mongoose';

export interface ICrisisEvent extends Document {
  userId: string;
  message: string;
  status: 'detected' | 'resolved' | 'escalated';
  reportedAt: Date;
}

const CrisisEventSchema = new Schema<ICrisisEvent>(
  {
    userId: { type: String, required: true, index: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['detected', 'resolved', 'escalated'], default: 'detected' },
    reportedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CrisisEventSchema.index({ userId: 1, reportedAt: -1 });

export const CrisisEvent = model<ICrisisEvent>('CrisisEvent', CrisisEventSchema);
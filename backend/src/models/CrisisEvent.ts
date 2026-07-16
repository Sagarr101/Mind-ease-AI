import { Schema, model, Document, Types } from 'mongoose';

export interface ICrisisEvent extends Document {
  userId: Types.ObjectId;
  message: string;
  status: 'detected' | 'resolved' | 'escalated';
  reportedAt: Date;
}

const CrisisEventSchema = new Schema<ICrisisEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['detected', 'resolved', 'escalated'], default: 'detected' },
    reportedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CrisisEventSchema.index({ userId: 1, reportedAt: -1 });

export const CrisisEvent = model<ICrisisEvent>('CrisisEvent', CrisisEventSchema);

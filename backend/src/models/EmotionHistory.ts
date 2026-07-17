import { Schema, model, Document, Types } from 'mongoose';

export interface IEmotionHistory extends Document {
  userId: string;
  journalEntryId?: Types.ObjectId;
  detectedAt: Date;
  dominantEmotion: string;
  confidence: number;
  distribution: Record<string, number>;
}

const EmotionHistorySchema = new Schema<IEmotionHistory>(
  {
    userId: { type: String, required: true, index: true },
    journalEntryId: { type: Schema.Types.ObjectId, ref: 'Journal', default: undefined },
    detectedAt: { type: Date, default: Date.now, index: true },
    dominantEmotion: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    distribution: { type: Object, required: true },
  },
  { timestamps: true }
);

EmotionHistorySchema.index({ userId: 1, detectedAt: -1 });

export const EmotionHistory = model<IEmotionHistory>('EmotionHistory', EmotionHistorySchema);
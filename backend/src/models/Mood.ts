import { Schema, model, Document, Types } from 'mongoose';

export interface IMood extends Document {
  userId: Types.ObjectId;
  score: number; // 1: Awful, 2: Bad, 3: Okay, 4: Good, 5: Excellent
  tags: string[]; // e.g., ["stressed", "calm", "anxious", "happy"]
  note?: string;
  loggedAt: Date;
}

const MoodSchema = new Schema<IMood>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  tags: {
    type: [String],
    default: [],
  },
  note: {
    type: String,
    trim: true,
  },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Mood = model<IMood>('Mood', MoodSchema);

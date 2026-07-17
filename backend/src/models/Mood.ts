import { Schema, model, Document } from 'mongoose';

export interface IMood extends Document {
  userId: string;
  score: number; // 1: Awful, 2: Bad, 3: Okay, 4: Good, 5: Excellent
  tags: string[]; // e.g., ["stressed", "calm", "anxious", "happy"]
  note?: string;
  loggedAt: Date;
}

const MoodSchema = new Schema<IMood>({
  userId: {
    type: String,
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

// Index for faster lookups by user
MoodSchema.index({ userId: 1, loggedAt: -1 });

export const Mood = model<IMood>('Mood', MoodSchema);
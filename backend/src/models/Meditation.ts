import { Schema, model, Document } from 'mongoose';

export interface IMeditationSession extends Document {
  userId: string;
  title: string; // Name of guide or custom session (e.g. "Mindful Breath")
  durationMinutes: number;
  completedAt: Date;
}

const MeditationSessionSchema = new Schema<IMeditationSession>({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Meditation session title is required'],
    trim: true,
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Meditation duration in minutes is required'],
    min: [1, 'Meditation must be at least 1 minute long'],
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster lookups by user
MeditationSessionSchema.index({ userId: 1, completedAt: -1 });

export const MeditationSession = model<IMeditationSession>('MeditationSession', MeditationSessionSchema);
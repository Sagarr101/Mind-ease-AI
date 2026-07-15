import { Schema, model, Document, Types } from 'mongoose';

export interface IMeditationSession extends Document {
  userId: Types.ObjectId;
  title: string; // Name of guide or custom session (e.g. "Mindful Breath")
  durationMinutes: number;
  completedAt: Date;
}

const MeditationSessionSchema = new Schema<IMeditationSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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

export const MeditationSession = model<IMeditationSession>('MeditationSession', MeditationSessionSchema);

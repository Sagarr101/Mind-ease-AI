import { Schema, model, Document } from 'mongoose';

export interface IJournal extends Document {
  userId: string;
  title: string;
  content: string;
  moodScore?: number; // Optional reference to mood rating at time of writing
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema = new Schema<IJournal>(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Journal title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Journal content is required'],
      trim: true,
    },
    moodScore: {
      type: Number,
      min: 1,
      max: 5,
    },
    sentiment: {
      type: String,
      enum: ['Positive', 'Negative', 'Neutral'],
      default: 'Neutral',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups by user
JournalSchema.index({ userId: 1, createdAt: -1 });

export const Journal = model<IJournal>('Journal', JournalSchema);
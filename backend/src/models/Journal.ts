import { Schema, model, Document, Types } from 'mongoose';

export interface IJournal extends Document {
  userId: Types.ObjectId;
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
      type: Schema.Types.ObjectId,
      ref: 'User',
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

export const Journal = model<IJournal>('Journal', JournalSchema);

import { Schema, model, Document } from 'mongoose';

export interface IWellnessReport extends Document {
  userId: string;
  startDate: Date;
  endDate: Date;
  averageMood: number;
  meditationTotalMinutes: number;
  journalsWritten: number;
  insights: string; // Dynamic narrative summarizing progress and CBT tips
  createdAt: Date;
}

const WellnessReportSchema = new Schema<IWellnessReport>({
  userId: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  averageMood: {
    type: Number,
    required: true,
  },
  meditationTotalMinutes: {
    type: Number,
    required: true,
  },
  journalsWritten: {
    type: Number,
    required: true,
  },
  insights: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster lookups by user
WellnessReportSchema.index({ userId: 1, createdAt: -1 });

export const WellnessReport = model<IWellnessReport>('WellnessReport', WellnessReportSchema);
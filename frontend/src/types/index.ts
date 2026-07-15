export interface IUser {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  streak: {
    current: number;
    longest: number;
    lastActive: string | null;
  };
  settings?: {
    theme: 'light' | 'dark';
    remindersEnabled: boolean;
  };
}

export interface IMood {
  _id: string;
  score: number;
  tags: string[];
  note?: string;
  loggedAt: string;
}

export interface IJournal {
  _id: string;
  title: string;
  content: string;
  moodScore?: number;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  createdAt: string;
  updatedAt: string;
}

export interface IChatMessage {
  _id: string;
  sender: 'user' | 'therapist';
  content: string;
  sentiment?: string;
  createdAt: string;
}

export interface IMeditationSession {
  _id: string;
  title: string;
  durationMinutes: number;
  completedAt: string;
}

export interface IWellnessReport {
  _id: string;
  startDate: string;
  endDate: string;
  averageMood: number;
  meditationTotalMinutes: number;
  journalsWritten: number;
  insights: string;
  createdAt: string;
}

export interface INotification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'streak' | 'report' | 'system';
  createdAt: string;
}

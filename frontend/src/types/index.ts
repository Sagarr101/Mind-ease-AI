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

// ===== NEW v2.0 Types =====

export interface IConversation {
  _id: string;
  userId: string;
  title?: string;
  participants: string[];
  lastActivity?: Date;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface IMessage {
  _id: string;
  userId: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sentiment?: string;
  emotions?: Record<string, number>;
}

export interface IEmotion {
  _id: string;
  userId: string;
  dominantEmotion: string;
  confidence: number;
  distribution: Record<string, number>;
  detectedAt: Date;
}

export interface IInsight {
  _id: string;
  userId: string;
  title: string;
  description: string;
  metric?: string;
  value?: any;
  generatedAt: Date;
}

export interface IKnowledgeBase {
  _id: string;
  title: string;
  content: string;
  source?: string;
  chunks?: string[];
  createdAt?: Date;
}

export interface ICrisisEvent {
  _id: string;
  userId: string;
  message: string;
  status: 'detected' | 'resolved' | 'escalated';
  reportedAt?: Date;
}

export interface IMessage {
  _id?: string;
  userId: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sentiment?: string;
  emotions?: Record<string, number>;
}

export interface IConversation {
  _id?: string;
  userId: string;
  title?: string;
  participants?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

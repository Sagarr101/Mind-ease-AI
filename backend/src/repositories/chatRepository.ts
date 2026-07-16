import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';

export class ChatRepository {
  async createConversation(userId: string, title?: string) {
    const conv = await Conversation.create({ userId, title, participants: [userId] });
    return conv;
  }

  async getConversationById(conversationId: string) {
    return Conversation.findById(conversationId).lean();
  }

  async createMessage(payload: any) {
    const msg = await Message.create(payload);
    // update conversation lastActivity
    await Conversation.findByIdAndUpdate(payload.conversationId, { lastActivity: new Date() }).exec();
    return msg;
  }

  async getMessagesByConversation(conversationId: string, limit = 50) {
    return Message.find({ conversationId }).sort({ timestamp: 1 }).limit(limit).lean();
  }
}

export default new ChatRepository();

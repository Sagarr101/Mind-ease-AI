import chatRepository from '../repositories/chatRepository';
import { buildPrompt } from '../ai/promptBuilder';
import { logger } from '../utils/logger';
import { Conversation } from '../models/Conversation';

export class ChatService {
  private repo = chatRepository;

  async getOrCreateConversation(userId: string, title = 'Default Chat') {
    const existing = await Conversation.findOne({ userId }).lean();
    if (existing) return existing;
    const conv = await Conversation.create({ userId, title, participants: [userId] });
    return conv;
  }

  async saveMessage(userId: string, conversationId: string, role: 'user' | 'assistant', content: string, meta: any = {}) {
    const msg = await this.repo.createMessage({
      userId,
      conversationId,
      role,
      content,
      timestamp: new Date(),
      ...meta,
    });
    return msg;
  }

  async saveUserMessage(userId: string, conversationId: string, content: string, meta: any = {}) {
    return this.saveMessage(userId, conversationId, 'user', content, meta);
  }

  async saveAssistantMessage(userId: string, conversationId: string, content: string, meta: any = {}) {
    return this.saveMessage(userId, conversationId, 'assistant', content, meta);
  }

  async getConversationHistory(conversationId: string, limit = 50) {
    return this.repo.getMessagesByConversation(conversationId, limit);
  }

  async buildContextAndRespond(userId: string, conversationId: string, message: string, extras: any = {}) {
    // Retrieve recent history
    const history = await this.getConversationHistory(conversationId, 50);
    // extras may include mood/journal/kb results
    const prompt = buildPrompt({ userId, conversationId, history, message, extras });
    logger.debug('Built prompt for LLM', prompt.substring(0, 400));
    // Actual LLM call will be added later; return prompt for now
    return { prompt };
  }
}

export default new ChatService();

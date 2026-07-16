import { EmotionHistory } from '../models/EmotionHistory';

class EmotionRepository {
  async addEmotionRecord(record: any) {
    return EmotionHistory.create(record);
  }

  async getRecentByUser(userId: string, limit = 50) {
    return EmotionHistory.find({ userId }).sort({ detectedAt: -1 }).limit(limit).lean();
  }
}

export default new EmotionRepository();

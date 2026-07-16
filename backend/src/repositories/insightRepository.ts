import { Insight } from '../models/Insight';

class InsightRepository {
  async createInsight(payload: any) {
    return Insight.create(payload);
  }

  async getRecentInsightsForUser(userId: string, limit = 20) {
    return Insight.find({ userId }).sort({ generatedAt: -1 }).limit(limit).lean();
  }
}

export default new InsightRepository();

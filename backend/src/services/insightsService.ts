import { Mood } from '../models/Mood';
import { Journal } from '../models/Journal';
import { MeditationSession } from '../models/Meditation';
import { Insight } from '../models/Insight';
import insightRepository from '../repositories/insightRepository';
import { logger } from '../utils/logger';

export class InsightsService {
  async generateWeeklyInsights(userId: string) {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // 1. Mood improvement analysis
      const moodLogs = await Mood.find({ userId, loggedAt: { $gte: weekAgo } }).lean();
      if (moodLogs.length >= 2) {
        const avgScore = moodLogs.reduce((sum: number, m: any) => sum + m.score, 0) / moodLogs.length;
        const improvement = avgScore > 3.5 ? 'improved' : avgScore < 2.5 ? 'declined' : 'stable';
        
        await insightRepository.createInsight({
          userId,
          title: `Your mood ${improvement} this week`,
          description: `Average mood score: ${avgScore.toFixed(1)}/5 over ${moodLogs.length} entries.`,
          metric: 'mood_trend',
          value: avgScore,
        });
      }

      // 2. Journal activity analysis
      const journalEntries = await Journal.find({ userId, createdAt: { $gte: weekAgo } }).lean();
      if (journalEntries.length > 0) {
        await insightRepository.createInsight({
          userId,
          title: `You journaled ${journalEntries.length} times this week`,
          description: `Great job maintaining your journaling habit! Regular reflection improves emotional awareness.`,
          metric: 'journal_count',
          value: journalEntries.length,
        });
      }

      // 3. Meditation streak analysis
      const meditations = await MeditationSession.find({ userId, completedAt: { $gte: weekAgo } }).lean();
      if (meditations.length > 0) {
        const totalMinutes = meditations.reduce((sum: number, m: any) => sum + m.durationMinutes, 0);
        await insightRepository.createInsight({
          userId,
          title: `You meditated for ${totalMinutes} minutes this week`,
          description: `${meditations.length} sessions completed. Meditation reduces stress and improves focus.`,
          metric: 'meditation_minutes',
          value: totalMinutes,
        });
      }

      // 4. Mood triggers analysis (tags from mood logs)
      const allTags: Record<string, number> = {};
      moodLogs.forEach((m: any) => {
        m.tags?.forEach((tag: string) => {
          allTags[tag] = (allTags[tag] || 0) + 1;
        });
      });

      const topTag = Object.entries(allTags).sort((a, b) => b[1] - a[1])[0];
      if (topTag) {
        await insightRepository.createInsight({
          userId,
          title: `Your most frequent mood: ${topTag[0]}`,
          description: `You logged "${topTag[0]}" ${topTag[1]} times this week. Understanding patterns helps you respond effectively.`,
          metric: 'top_mood_tag',
          value: topTag[0],
        });
      }

      logger.info(`Generated weekly insights for user ${userId}`);
    } catch (error) {
      logger.error('Error generating weekly insights:', error);
      throw error;
    }
  }

  async getUserInsights(userId: string, limit = 10) {
    return Insight.find({ userId }).sort({ generatedAt: -1 }).limit(limit).lean();
  }
}

export default new InsightsService();

import { CrisisEvent } from '../models/CrisisEvent';

class CrisisRepository {
  async logCrisisEvent(userId: string, message: string) {
    return CrisisEvent.create({ userId, message, status: 'detected' });
  }

  async getCrisisEventsForUser(userId: string, limit = 20) {
    return CrisisEvent.find({ userId }).sort({ reportedAt: -1 }).limit(limit).lean();
  }

  async updateCrisisStatus(eventId: string, status: 'detected' | 'resolved' | 'escalated') {
    return CrisisEvent.findByIdAndUpdate(eventId, { status }, { new: true }).lean();
  }
}

export default new CrisisRepository();

import { CrisisEvent } from '../models/CrisisEvent';
import { detectCrisisText } from '../middleware/crisisDetector';
import { logger } from '../utils/logger';

export interface CrisisResponse {
  isCrisis: boolean;
  compassionateReply?: string;
  resources?: {
    title: string;
    number: string;
    description: string;
  }[];
}

const CRISIS_RESOURCES: CrisisResponse['resources'] = [
  { title: '988 Suicide & Crisis Lifeline (US)', number: 'Call/Text 988', description: 'Free, confidential support 24/7' },
  { title: 'Crisis Text Line', number: 'Text HOME to 741741', description: 'Text-based crisis support' },
  { title: 'International Association for Suicide Prevention', number: 'https://www.iasp.info/resources/Crisis_Centres/', description: 'Worldwide resources' },
];

export class CrisisDetectionService {
  async detectAndRespond(userId: string, content: string): Promise<CrisisResponse> {
    const isCrisis = detectCrisisText(content);

    if (isCrisis) {
      logger.error(`[CRISIS DETECTED] User ${userId}: "${content}"`);
      
      // Log the crisis event for analytics
      await CrisisEvent.create({
        userId,
        message: content,
        status: 'detected',
      });

      return {
        isCrisis: true,
        compassionateReply: `I hear that you're in a lot of pain right now, and I want you to know that you're not alone. 
Your life has value, and there are people who care about you and want to help.
Please reach out to a crisis helpline immediately—they have trained counselors ready to listen and support you.`,
        resources: CRISIS_RESOURCES,
      };
    }

    return { isCrisis: false };
  }
}

export default new CrisisDetectionService();

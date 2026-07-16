const EMOTION_KEYWORDS: Record<string, string[]> = {
  happy: ['happy', 'joy', 'joyful', 'delighted', 'wonderful', 'amazing', 'great'],
  calm: ['calm', 'peaceful', 'serene', 'tranquil', 'relaxed', 'composed'],
  excited: ['excited', 'thrilled', 'energetic', 'pumped', 'enthusiastic'],
  grateful: ['grateful', 'thankful', 'appreciative', 'blessed'],
  hopeful: ['hopeful', 'optimistic', 'encouraged', 'inspired'],
  motivated: ['motivated', 'driven', 'determined', 'focused'],
  sad: ['sad', 'unhappy', 'depressed', 'melancholy', 'down', 'blue'],
  lonely: ['lonely', 'isolated', 'alone', 'disconnected'],
  angry: ['angry', 'furious', 'frustrated', 'irritated', 'annoyed', 'resentful'],
  fearful: ['fearful', 'afraid', 'scared', 'terrified', 'anxious'],
  anxious: ['anxious', 'nervous', 'worried', 'concerned', 'stressed'],
  stressed: ['stressed', 'overwhelmed', 'burdened', 'pressured'],
  burnedOut: ['burned out', 'exhausted', 'drained', 'fatigued'],
  overwhelmed: ['overwhelmed', 'overloaded', 'swamped'],
  guilty: ['guilty', 'ashamed', 'regretful', 'remorseful'],
  confused: ['confused', 'bewildered', 'uncertain', 'puzzled'],
};

export const detectEmotions = (text: string): { dominant: string; confidence: number; distribution: Record<string, number> } => {
  const t = text.toLowerCase();
  const scores: Record<string, number> = {};

  Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
    const matches = keywords.filter(kw => t.includes(kw)).length;
    scores[emotion] = matches;
  });

  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const distribution: Record<string, number> = {};
  let maxScore = 0;
  let dominant = 'neutral';

  Object.entries(scores).forEach(([emotion, score]) => {
    const normalized = score / total;
    distribution[emotion] = normalized;
    if (normalized > maxScore) {
      maxScore = normalized;
      dominant = emotion;
    }
  });

  return {
    dominant,
    confidence: maxScore || 0.1,
    distribution,
  };
};

export default { detectEmotions };

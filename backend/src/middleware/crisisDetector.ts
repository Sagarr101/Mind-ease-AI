import { Request, Response, NextFunction } from 'express';

const CRISIS_PHRASES = [
  'i want to die',
  'i want to kill myself',
  'suicide',
  'end my life',
  "no reason to live",
  'hurt myself',
  'self harm',
  "nobody cares about me",
  "i can't go on",
];

export const detectCrisisText = (text: string): boolean => {
  if (!text) return false;
  const t = text.toLowerCase();
  return CRISIS_PHRASES.some((p) => t.includes(p));
};

// Express middleware example that marks req as crisis if detected
export const crisisMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const content = (req.body && (req.body.content || req.body.message)) || '';
  const flagged = detectCrisisText(String(content));
  (req as any).crisisDetected = flagged;
  next();
};

export default crisisMiddleware;

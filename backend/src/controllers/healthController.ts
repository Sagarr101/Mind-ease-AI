import { Request, Response } from 'express';

export const health = (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
};

export default { health };

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  role: 'admin' | 'manager' | 'employee';
  company: string;
}

export interface AuthedRequest extends Request {
  user?: JwtPayload;
}

export function auth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) { res.status(401).json({ message: 'Unauthorized' }); return; }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

export function permit(...roles: Array<JwtPayload['role']>) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
}

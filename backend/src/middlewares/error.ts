import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export function notFoundHandler(_: Request, res: Response): void {
  res.status(404).json({ message: 'Not Found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  logger.error('Unhandled error', { err });
  const status = err?.status || 500;
  res.status(status).json({ message: err?.message || 'Internal Server Error' });
}

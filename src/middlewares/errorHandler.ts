import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, statusCode: err.statusCode }
    });
    return;
  }

  logger.error(err);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error', statusCode: 500 }
  });
}

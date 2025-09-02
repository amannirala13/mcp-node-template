// src/middlewares/error.ts
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../core/logger.js';

/**
 * Error handling middleware.
 * @param err - The error object.
 * @param _req - The request object.
 * @param res - The response object.
 * @param _next - The next middleware function.
 *
 * @example - Basic usage
 * ```ts
 *      import { errorHandler } from './middlewares/error.js';
 *
 *      app.use(errorHandler);
 * ```
 */
export function errorHandler(err: Error | null | undefined, _req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  logger.error({message, error: err });
  res.status(500).json({ error: message });
}
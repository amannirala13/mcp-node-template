// src/bootstrap/http.ts
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env } from '../core/env.js';

/**
 * Apply HTTP defaults to the Express app.
 * @param app - The Express app to apply defaults to.
 *
 * @example - Basic usage
 *  ```ts
 *      import { applyHttpDefaults } from './bootstrap/http.js';
 *
 *      applyHttpDefaults(app);
 *  ```
 */
export function applyHttpDefaults(app: import('express').Express) {
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({ origin: env.CORS_ORIGINS.split(',').map(s => s.trim()) })
  );
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));
  app.use(pinoHttp());
}
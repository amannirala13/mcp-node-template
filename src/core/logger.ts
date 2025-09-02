// src/logger.ts
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';
const level = process.env.LOG_LEVEL || 'info';

export const logger = pino(
  isDev && process.stdout.isTTY
    ? {
        level,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
            singleLine: false
          }
        }
      }
    : { level }
    
);
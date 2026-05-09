import pino from 'pino';
import { env, isProduction } from '../config';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction() ? 'info' : 'debug'),
  transport: isProduction()
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      },
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: env.NODE_ENV,
  },
});

export const createRequestLogger = () => {
  return pino({
    level: 'info',
    transport: isProduction()
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
          },
        },
  });
};

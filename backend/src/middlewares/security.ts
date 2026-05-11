import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from '../config';

export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200,
});

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'http://localhost:5001', 'http://localhost:3000'],
      connectSrc: ["'self'", 'http://localhost:5001'],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

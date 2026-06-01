import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  BACKEND_URL: string;
  FRONTEND_URL: string;
  MERCADOPAGO_ACCESS_TOKEN: string;
  MERCADOPAGO_WEBHOOK_SECRET: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const validateCriticalEnvVars = (): void => {
  const critical = [
    'JWT_SECRET',
    'MONGODB_URI',
    'MERCADOPAGO_ACCESS_TOKEN',
    'MERCADOPAGO_WEBHOOK_SECRET',
    'BACKEND_URL',
    'FRONTEND_URL',
  ];

  const missing: string[] = [];

  for (const key of critical) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `CRITICAL: Missing required environment variables: ${missing.join(', ')}\n` +
        'Application cannot start without these variables. Please check your .env file.'
    );
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('CRITICAL: JWT_SECRET must be at least 32 characters long for security');
  }

  // Validate URL formats
  const urlVars = ['BACKEND_URL', 'FRONTEND_URL'];
  for (const key of urlVars) {
    const value = process.env[key];
    if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
      throw new Error(`CRITICAL: ${key} must be a valid URL starting with http:// or https://`);
    }
  }
};

validateCriticalEnvVars();

export const env: EnvConfig = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVariable('PORT', '5001'), 10),
  MONGODB_URI: getEnvVariable('MONGODB_URI'),
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVariable('JWT_EXPIRES_IN', '7d'),
  CORS_ORIGIN: getEnvVariable('CORS_ORIGIN', 'http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: parseInt(getEnvVariable('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(getEnvVariable('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  BACKEND_URL: getEnvVariable('BACKEND_URL'),
  FRONTEND_URL: getEnvVariable('FRONTEND_URL'),
  MERCADOPAGO_ACCESS_TOKEN: getEnvVariable('MERCADOPAGO_ACCESS_TOKEN'),
  MERCADOPAGO_WEBHOOK_SECRET: getEnvVariable('MERCADOPAGO_WEBHOOK_SECRET'),
};

export const isProduction = (): boolean => env.NODE_ENV === 'production';
export const isDevelopment = (): boolean => env.NODE_ENV === 'development';
export const isTest = (): boolean => env.NODE_ENV === 'test';

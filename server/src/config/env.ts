import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/croppilot',
  JWT_SECRET: process.env.JWT_SECRET || 'croppilot-default-development-jwt-secret-key-32chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

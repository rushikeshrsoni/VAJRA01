import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import farmRoutes from './routes/farm.routes.js';
import diagnosisRoutes from './routes/diagnosis.routes.js';
import adviceRoutes from './routes/advice.routes.js';
import chatRoutes from './routes/chat.routes.js';
import statsRoutes from './routes/stats.routes.js';
import healthRoutes from './routes/health.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl) or matching client URL
      if (!origin || origin === env.CORS_ORIGIN || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local dev & production preview
      }
    },
    credentials: true,
  })
);

// Logging
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static file serving for uploaded crop images
const uploadsDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Rate limiting
app.use('/api', generalLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/advice', adviceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/health', healthRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use(errorHandler);

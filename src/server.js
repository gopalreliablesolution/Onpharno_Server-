import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { csrfProtection } from './middleware/csrf.js';
import { getUploadDir } from './services/uploadService.js';

dotenv.config();

// Connect to Database in non-test environments
if (process.env.NODE_ENV !== 'test') {
  const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      console.error(`Missing required environment variable: ${key}`);
      process.exit(1);
    }
  }
  connectDB();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = [
  CLIENT_URL,
  'https://onpharno.netlify.app',
  'https://onpharno.com',
  'https://www.onpharno.com',
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://localhost:3000'] : []),
].filter(Boolean);

// Security & Parsing Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());
app.use('/api/v1', csrfProtection);

// Static uploads directory (Server-stored files - Local durable storage)
const uploadsDir = getUploadDir();
app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: '365d',
    immutable: true,
    index: false,
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  })
);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ONPHARNO API is operating normally',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1', publicRoutes);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  const isUploadOrClientError =
    err.name === 'MulterError' ||
    err.status === 400 ||
    /file|upload|extension|csrf|validation|payload/i.test(err.message || '');
  const status = isUploadOrClientError ? (err.status || 400) : (err.status || 500);

  if (status >= 500 && process.env.NODE_ENV !== 'test') {
    console.error('Unhandled Server Error:', err);
  }
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

let server = null;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`🚀 ONPHARNO Server listening on http://localhost:${PORT}`);
    console.log(`📁 Static files served from: ${uploadsDir}`);
  });
}

export { server };
export default app;

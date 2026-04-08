import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes        from './routes/auth.routes.js';
import jobRoutes         from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';
import userRoutes        from './routes/user.routes.js';
import { errorHandler }  from './middleware/error.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── ROOT ROUTE (FIX FOR RENDER) ──────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    message: "HireFlow API is running 🚀",
    status: "success"
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/jobs',         jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users',        userRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
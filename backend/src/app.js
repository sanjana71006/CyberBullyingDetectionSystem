import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import analyzeRoutes from './routes/analyzeRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'cybershield-backend' });
});

app.use('/api', analyzeRoutes);
app.use('/api', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.js';
import { getAllProviders } from './providers/index.js';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', chatRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  const providers = getAllProviders();
  const available: string[] = [];
  const unavailable: string[] = [];

  for (const [key, provider] of providers) {
    if (provider.isAvailable()) {
      available.push(key);
    } else {
      unavailable.push(key);
    }
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    providers: { available, unavailable },
  });
});

// Start server
app.listen(PORT, () => {
  const providers = getAllProviders();
  const available: string[] = [];
  for (const [key, provider] of providers) {
    if (provider.isAvailable()) available.push(key);
  }

  console.log(`Orchestree server running on http://localhost:${PORT}`);
  console.log(`Available providers: ${available.length > 0 ? available.join(', ') : 'none (set API keys in .env)'}`);
});

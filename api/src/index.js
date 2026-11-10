import express from 'express';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import { attachUser } from './auth.js';
import { bootstrap } from './bootstrap.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import miscRoutes from './routes/misc.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/data/uploads';

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.get('/api/health', async (_req, res) => {
  try {
    const { pool } = await import('./db.js');
    await pool.query('select 1');
    res.json({ ok: true, service: 'yas-sports-api' });
  } catch (error) {
    res.status(503).json({ ok: false, error: error.message });
  }
});

app.use('/api/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));
app.use('/api/auth', attachUser, authRoutes);
app.use('/api/products', attachUser, productRoutes);
app.use('/api/orders', attachUser, orderRoutes);
app.use('/api', attachUser, miscRoutes);
app.use('/api/admin', attachUser, adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'مسیر مورد نظر پیدا نشد.' });
});

app.use((error, _req, res, _next) => {
  console.error('[yas api]', error.message);
  res.status(error.status || 500).json({ error: error.message || 'خطای غیرمنتظره در سرور رخ داد.' });
});

async function start() {
  let attempts = 0;
  while (attempts < 20) {
    try {
      await bootstrap();
      break;
    } catch (error) {
      attempts += 1;
      console.warn(`[yas api] bootstrap attempt ${attempts} failed: ${error.message}`);
      if (attempts >= 20) process.exit(1);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[yas api] listening on ${PORT}`);
  });
}

start();

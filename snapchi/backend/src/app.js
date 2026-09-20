import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import requireAuth from './middlewares/auth.middleware.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/categories.routes.js';
import transactionRoutes from './routes/transactions.routes.js';

const app = express();

// Render nằm sau proxy, cần để rate limit và cookie secure hoạt động đúng
app.set('trust proxy', 1);
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', requireAuth, categoryRoutes);
app.use('/api/transactions', requireAuth, transactionRoutes);

// Bắt mọi lỗi từ async handler (nhờ express-async-errors)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Lỗi máy chủ' });
});

const port = process.env.PORT || 4000;
connectDB()
  .then(() => app.listen(port, () => console.log(`API chạy ở cổng ${port}`)))
  .catch((err) => {
    console.error('Không kết nối được MongoDB:', err.message);
    process.exit(1);
  });

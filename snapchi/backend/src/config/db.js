import mongoose from 'mongoose';
import Category from '../models/Category.js';

const DEFAULT_CATEGORIES = [
  { name: 'Ăn uống', color: '#B4654A', icon: '🍜' },
  { name: 'Di chuyển', color: '#4E6E8C', icon: '🛵' },
  { name: 'Giải trí', color: '#7A5A8A', icon: '🎬' },
  { name: 'Hoá đơn', color: '#5C7A50', icon: '🧾' },
  { name: 'Khác', color: '#7C7566', icon: '✨' },
];

export async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const c of DEFAULT_CATEGORIES) {
    await Category.updateOne(
      { name: c.name, isDefault: true },
      { $setOnInsert: { ...c, userId: null, isDefault: true } },
      { upsert: true }
    );
  }
  console.log('MongoDB connected');
}

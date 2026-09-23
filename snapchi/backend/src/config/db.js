import mongoose from 'mongoose';

// Danh mục của từng user được tạo lúc đăng ký/đăng nhập (xem utils/categories.js)
export async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
}

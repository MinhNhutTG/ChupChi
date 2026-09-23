import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    amount: { type: Number, required: true, min: 1000 },
    label: { type: String, default: '', trim: true, maxlength: 200 },
    // Nhập tay không có ảnh: để null, frontend hiển thị ảnh placeholder
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null }, // dùng để xoá ảnh trên Cloudinary
    transactionDate: { type: Date, required: true },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, transactionDate: 1 });

export default mongoose.model('Transaction', transactionSchema);

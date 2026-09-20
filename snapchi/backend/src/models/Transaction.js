import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    amount: { type: Number, required: true, min: 0 },
    label: { type: String, default: '', trim: true, maxlength: 200 },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true }, // dùng để xoá ảnh trên Cloudinary
    transactionDate: { type: Date, required: true },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, transactionDate: 1 });

export default mongoose.model('Transaction', transactionSchema);

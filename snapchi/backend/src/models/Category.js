import mongoose from 'mongoose';

// Mỗi user có bộ danh mục riêng. Bản ghi userId=null là danh mục dùng chung của phiên bản cũ,
// chỉ còn dùng để chuyển dữ liệu (xem utils/categories.js).
const categorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  name: { type: String, required: true, trim: true, maxlength: 40 },
  color: { type: String, default: '#7C7566' },
  isProtected: { type: Boolean, default: false }, // "Khác": không xoá được
});

export default mongoose.model('Category', categorySchema);

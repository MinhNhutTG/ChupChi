import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null, index: true },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: null },
    // Không đặt default: tài khoản cũ (chưa có field) coi như đã xác thực, chỉ `false` mới bị chặn
    emailVerified: { type: Boolean },
    verifyToken: { type: String, default: null }, // hash SHA-256
    verifyExpires: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null }, // hash SHA-256
    resetPasswordExpires: { type: Date, default: null },
    // Yêu cầu xoá tài khoản: xoá thật sau 24 giờ, đăng nhập lại sẽ huỷ
    deletionRequestedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);

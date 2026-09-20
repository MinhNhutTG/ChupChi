import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null, index: true },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: null },
    resetPasswordToken: { type: String, default: null }, // lưu hash SHA-256 của token
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);

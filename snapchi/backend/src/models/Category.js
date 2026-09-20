import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#7C7566' },
  icon: { type: String, default: '✨' },
  isDefault: { type: Boolean, default: false },
});

export default mongoose.model('Category', categorySchema);

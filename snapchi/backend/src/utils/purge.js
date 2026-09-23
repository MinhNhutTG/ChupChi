import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';

const DAY_MS = 24 * 3600 * 1000;

// Xoá thật các tài khoản đã yêu cầu xoá quá 24 giờ (kèm giao dịch, danh mục, ảnh Cloudinary)
export async function purgeDeletedAccounts() {
  const cutoff = new Date(Date.now() - DAY_MS);
  const users = await User.find({ deletionRequestedAt: { $ne: null, $lte: cutoff } });
  for (const user of users) {
    try {
      const txs = await Transaction.find({ userId: user._id, imagePublicId: { $ne: null } }, 'imagePublicId');
      const ids = txs.map((t) => t.imagePublicId);
      for (let i = 0; i < ids.length; i += 100) {
        await cloudinary.api.delete_resources(ids.slice(i, i + 100));
      }
      await Transaction.deleteMany({ userId: user._id });
      await Category.deleteMany({ userId: user._id });
      await user.deleteOne();
      console.log('Đã xoá tài khoản', user._id.toString());
    } catch (err) {
      console.error('Xoá tài khoản thất bại:', user._id.toString(), err.message);
    }
  }
}

export function startPurgeJob() {
  const run = () => purgeDeletedAccounts().catch((e) => console.error('purge lỗi:', e.message));
  run();
  setInterval(run, 3600 * 1000).unref();
}

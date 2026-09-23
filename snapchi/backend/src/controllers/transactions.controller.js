import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';
import { monthRange, dayRange, TZ_OFFSET_HOURS } from '../utils/date.js';

const TZ = `+0${TZ_OFFSET_HOURS}:00`;
const MIN_AMOUNT = 1000;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// URL phải là ảnh gốc của đúng cloud_name và khớp với publicId (nằm trong folder snapchi/).
// Kiểm tra khớp để client không thể gửi publicId của ảnh khác rồi nhờ server xoá hộ.
function validImage(imageUrl, publicId) {
  if (typeof imageUrl !== 'string' || typeof publicId !== 'string') return false;
  if (!publicId.startsWith('snapchi/') || publicId.includes('..')) return false;
  const re = new RegExp(
    `^https://res\\.cloudinary\\.com/${escapeRe(process.env.CLOUDINARY_CLOUD_NAME)}/image/upload/(v\\d+/)?${escapeRe(publicId)}(\\.[a-zA-Z0-9]+)?$`
  );
  return re.test(imageUrl);
}

const validAmount = (a) => Number.isInteger(Number(a)) && Number(a) >= MIN_AMOUNT;

async function validCategory(userId, categoryId) {
  if (!mongoose.isValidObjectId(categoryId)) return false;
  return !!(await Category.exists({ _id: categoryId, userId }));
}

async function destroyImage(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Xoá ảnh Cloudinary thất bại:', err.message);
  }
}

export async function calendar(req, res) {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (!year || !(month >= 1 && month <= 12))
    return res.status(400).json({ message: 'month/year không hợp lệ' });

  const { start, end } = monthRange(year, month);
  const match = {
    userId: new mongoose.Types.ObjectId(req.userId),
    transactionDate: { $gte: start, $lt: end },
  };

  const [days, byCategory] = await Promise.all([
    Transaction.aggregate([
      { $match: match },
      { $sort: { transactionDate: 1 } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate', timezone: TZ } },
          count: { $sum: 1 },
          total: { $sum: '$amount' },
          images: { $push: '$imageUrl' }, // null nếu nhập tay
        },
      },
      { $project: { _id: 0, date: '$_id', count: 1, total: 1, images: { $slice: ['$images', 2] } } },
      { $sort: { date: 1 } },
    ]),
    Transaction.aggregate([
      { $match: match },
      { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
      { $project: { _id: 0, categoryId: '$_id', total: 1 } },
    ]),
  ]);

  res.json({ days, byCategory, total: byCategory.reduce((s, c) => s + c.total, 0) });
}

export async function day(req, res) {
  const range = dayRange(req.query.date);
  if (!range) return res.status(400).json({ message: 'date phải có dạng YYYY-MM-DD' });
  const items = await Transaction.find({
    userId: req.userId,
    transactionDate: { $gte: range.start, $lt: range.end },
  })
    .sort({ transactionDate: 1 })
    .populate('categoryId', 'name color');
  res.json(items);
}

export async function create(req, res) {
  const { amount, categoryId, label, imageUrl, imagePublicId, transactionDate } = req.body;
  if (!validAmount(amount))
    return res.status(400).json({ message: 'Giá tiền tối thiểu 1.000₫' });
  if (!(await validCategory(req.userId, categoryId)))
    return res.status(400).json({ message: 'Danh mục không hợp lệ' });

  const hasImage = !!(imageUrl || imagePublicId);
  if (hasImage && !validImage(imageUrl, imagePublicId))
    return res.status(400).json({ message: 'Ảnh không hợp lệ' });

  const date = transactionDate ? new Date(transactionDate) : new Date();
  if (Number.isNaN(date.getTime())) return res.status(400).json({ message: 'Ngày không hợp lệ' });

  const tx = await Transaction.create({
    userId: req.userId,
    categoryId,
    amount: Number(amount),
    label,
    imageUrl: hasImage ? imageUrl : null,
    imagePublicId: hasImage ? imagePublicId : null,
    transactionDate: date,
  });
  res.status(201).json(tx);
}

export async function update(req, res) {
  const { amount, categoryId, label, transactionDate, imageUrl, imagePublicId } = req.body;
  const tx = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
  if (!tx) return res.status(404).json({ message: 'Không tìm thấy giao dịch' });

  if (amount !== undefined) {
    if (!validAmount(amount)) return res.status(400).json({ message: 'Giá tiền tối thiểu 1.000₫' });
    tx.amount = Number(amount);
  }
  if (categoryId !== undefined) {
    if (!(await validCategory(req.userId, categoryId)))
      return res.status(400).json({ message: 'Danh mục không hợp lệ' });
    tx.categoryId = categoryId;
  }
  if (label !== undefined) tx.label = label;
  if (transactionDate !== undefined) {
    const d = new Date(transactionDate);
    if (Number.isNaN(d.getTime())) return res.status(400).json({ message: 'Ngày không hợp lệ' });
    tx.transactionDate = d;
  }

  // Đổi ảnh: ảnh cũ trên Cloudinary bị xoá sau khi lưu thành công
  let oldPublicId = null;
  if (imageUrl !== undefined || imagePublicId !== undefined) {
    if (!validImage(imageUrl, imagePublicId))
      return res.status(400).json({ message: 'Ảnh không hợp lệ' });
    if (tx.imagePublicId !== imagePublicId) oldPublicId = tx.imagePublicId;
    tx.imageUrl = imageUrl;
    tx.imagePublicId = imagePublicId;
  }

  await tx.save();
  await destroyImage(oldPublicId);
  res.json(tx);
}

export async function remove(req, res) {
  const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!tx) return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
  await destroyImage(tx.imagePublicId);
  res.json({ message: 'Đã xoá' });
}

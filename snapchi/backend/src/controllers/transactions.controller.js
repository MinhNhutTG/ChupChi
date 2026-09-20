import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';
import { monthRange, dayRange, TZ_OFFSET_HOURS } from '../utils/date.js';

const TZ = `+0${TZ_OFFSET_HOURS}:00`;

// imageUrl phải thuộc đúng cloud_name của mình
function validImage(imageUrl, publicId) {
  const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;
  return typeof imageUrl === 'string' && imageUrl.startsWith(prefix) && !!publicId;
}

async function validCategory(userId, categoryId) {
  if (!mongoose.isValidObjectId(categoryId)) return false;
  return !!(await Category.exists({
    _id: categoryId,
    $or: [{ isDefault: true }, { userId }],
  }));
}

export async function calendar(req, res) {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (!year || !(month >= 1 && month <= 12))
    return res.status(400).json({ message: 'month/year không hợp lệ' });

  const { start, end } = monthRange(year, month);
  const days = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.userId),
        transactionDate: { $gte: start, $lt: end },
      },
    },
    { $sort: { transactionDate: 1 } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate', timezone: TZ } },
        count: { $sum: 1 },
        total: { $sum: '$amount' },
        images: { $push: '$imageUrl' },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1,
        total: 1,
        images: { $slice: ['$images', 3] },
      },
    },
    { $sort: { date: 1 } },
  ]);
  res.json(days);
}

export async function day(req, res) {
  const range = dayRange(req.query.date);
  if (!range) return res.status(400).json({ message: 'date phải có dạng YYYY-MM-DD' });
  const items = await Transaction.find({
    userId: req.userId,
    transactionDate: { $gte: range.start, $lt: range.end },
  })
    .sort({ transactionDate: 1 })
    .populate('categoryId', 'name color icon');
  res.json(items);
}

export async function create(req, res) {
  const { amount, categoryId, label, imageUrl, imagePublicId, transactionDate } = req.body;
  if (!(Number(amount) >= 0)) return res.status(400).json({ message: 'Số tiền không hợp lệ' });
  if (!validImage(imageUrl, imagePublicId))
    return res.status(400).json({ message: 'Ảnh không hợp lệ' });
  if (!(await validCategory(req.userId, categoryId)))
    return res.status(400).json({ message: 'Danh mục không hợp lệ' });
  const date = transactionDate ? new Date(transactionDate) : new Date();
  if (Number.isNaN(date.getTime())) return res.status(400).json({ message: 'Ngày không hợp lệ' });

  const tx = await Transaction.create({
    userId: req.userId,
    categoryId,
    amount: Number(amount),
    label,
    imageUrl,
    imagePublicId,
    transactionDate: date,
  });
  res.status(201).json(tx);
}

export async function update(req, res) {
  const { amount, categoryId, label, transactionDate } = req.body;
  const tx = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
  if (!tx) return res.status(404).json({ message: 'Không tìm thấy giao dịch' });

  if (amount !== undefined) {
    if (!(Number(amount) >= 0)) return res.status(400).json({ message: 'Số tiền không hợp lệ' });
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
  await tx.save();
  res.json(tx);
}

export async function remove(req, res) {
  const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!tx) return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
  try {
    await cloudinary.uploader.destroy(tx.imagePublicId);
  } catch (err) {
    console.error('Xoá ảnh Cloudinary thất bại:', err.message);
  }
  res.json({ message: 'Đã xoá' });
}

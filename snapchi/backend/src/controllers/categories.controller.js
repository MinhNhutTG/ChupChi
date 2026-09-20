import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';

export async function list(req, res) {
  const categories = await Category.find({
    $or: [{ isDefault: true }, { userId: req.userId }],
  }).sort({ isDefault: -1, _id: 1 });
  res.json(categories);
}

export async function create(req, res) {
  const { name, color, icon } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Vui lòng nhập tên danh mục' });
  const category = await Category.create({
    userId: req.userId,
    name,
    color,
    icon,
    isDefault: false,
  });
  res.status(201).json(category);
}

export async function remove(req, res) {
  // Chỉ xoá được danh mục của chính mình (chống IDOR), không xoá được danh mục mặc định
  const category = await Category.findOne({ _id: req.params.id, userId: req.userId, isDefault: false });
  if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
  if (await Transaction.exists({ userId: req.userId, categoryId: category._id }))
    return res.status(409).json({ message: 'Danh mục đang có giao dịch, không thể xoá' });
  await category.deleteOne();
  res.json({ message: 'Đã xoá' });
}

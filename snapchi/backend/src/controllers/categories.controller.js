import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';
import { COLOR_RE, ensureUserCategories } from '../utils/categories.js';

function parseFields({ name, color }, { partial = false } = {}) {
  const out = {};
  if (!partial || name !== undefined) {
    if (!name?.trim()) return { error: 'Vui lòng nhập tên danh mục' };
    if (name.trim().length > 40) return { error: 'Tên danh mục tối đa 40 ký tự' };
    out.name = name.trim();
  }
  if (color !== undefined) {
    if (!COLOR_RE.test(color)) return { error: 'Màu không hợp lệ' };
    out.color = color;
  }
  return { value: out };
}

export async function list(req, res) {
  await ensureUserCategories(req.userId);
  res.json(await Category.find({ userId: req.userId }).sort({ _id: 1 }));
}

export async function create(req, res) {
  const { value, error } = parseFields(req.body);
  if (error) return res.status(400).json({ message: error });
  const category = await Category.create({ ...value, userId: req.userId });
  res.status(201).json(category);
}

export async function update(req, res) {
  const { value, error } = parseFields(req.body, { partial: true });
  if (error) return res.status(400).json({ message: error });
  // Luôn lọc theo userId để chống IDOR
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    value,
    { new: true }
  );
  if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
  res.json(category);
}

export async function remove(req, res) {
  const category = await Category.findOne({ _id: req.params.id, userId: req.userId });
  if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
  if (category.isProtected)
    return res.status(400).json({ message: 'Không thể xoá danh mục này' });

  // Giao dịch cũ chuyển sang "Khác"
  const fallback = await Category.findOne({ userId: req.userId, isProtected: true });
  await Transaction.updateMany(
    { userId: req.userId, categoryId: category._id },
    { categoryId: fallback._id }
  );
  await category.deleteOne();
  res.json({ message: 'Đã xoá', movedTo: fallback._id });
}

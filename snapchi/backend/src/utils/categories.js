import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';

export const DEFAULT_CATEGORIES = [
  { name: 'Ăn uống', color: '#B4654A' },
  { name: 'Di chuyển', color: '#4E6E8C' },
  { name: 'Giải trí', color: '#7A5A8A' },
  { name: 'Hoá đơn', color: '#5C7A50' },
  { name: 'Khác', color: '#7C7566', isProtected: true },
];

export const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const pending = new Map(); // tránh tạo trùng khi nhiều request đến cùng lúc

// Đảm bảo user có bộ danh mục riêng. User cũ (dùng danh mục chung) được chuyển sang bộ mới,
// giao dịch cũ được gán lại theo tên danh mục.
export function ensureUserCategories(userId) {
  const key = String(userId);
  if (!pending.has(key)) {
    pending.set(
      key,
      run(userId).finally(() => pending.delete(key))
    );
  }
  return pending.get(key);
}

async function run(userId) {
  if (await Category.exists({ userId })) return;
  const created = await Category.insertMany(DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })));
  const byName = Object.fromEntries(created.map((c) => [c.name, c._id]));

  const legacy = await Category.find({ userId: null });
  for (const l of legacy) {
    await Transaction.updateMany(
      { userId, categoryId: l._id },
      { categoryId: byName[l.name] || byName['Khác'] }
    );
  }
}

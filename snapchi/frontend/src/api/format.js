// Ảnh placeholder cho giao dịch nhập tay (không có ảnh)
export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='100%' height='100%' fill='#D5DBD0'/><text x='50%' y='50%' font-family='sans-serif' font-size='16' fill='#8A9484' text-anchor='middle'>không có ảnh</text></svg>"
  );

export const fmt = (n) => Number(n).toLocaleString('vi-VN') + '₫';
export const pad = (n) => String(n).padStart(2, '0');
export const MONTH_LABEL = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);

// Múi giờ cố định UTC+7, khớp với cách backend nhóm ngày
const VN_OFFSET = 7 * 3600 * 1000;
export function vnParts(date = new Date()) {
  const d = new Date(new Date(date).getTime() + VN_OFFSET);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}
export const vnDateKey = ({ year, month, day }) => `${year}-${pad(month)}-${pad(day)}`;

export function fmtDate(date) {
  const t = vnParts(date);
  const now = vnParts();
  if (vnDateKey(t) === vnDateKey(now)) return 'Hôm nay';
  return `${t.day}/${t.month}`;
}

export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(-2).map((w) => w[0]?.toUpperCase()).join('') || '?';

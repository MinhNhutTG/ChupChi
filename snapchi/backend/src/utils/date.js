// v1: cố định múi giờ UTC+7 (Việt Nam)
export const TZ_OFFSET_HOURS = 7;
const OFFSET_MS = TZ_OFFSET_HOURS * 3600 * 1000;

// Đầu tháng (giờ VN) dưới dạng Date UTC. month: 1-12
export function monthRange(year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1) - OFFSET_MS);
  const end = new Date(Date.UTC(year, month, 1) - OFFSET_MS);
  return { start, end };
}

// 'YYYY-MM-DD' (ngày theo giờ VN) -> [00:00, 24:00) dưới dạng Date UTC
export function dayRange(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d) - OFFSET_MS);
  if (Number.isNaN(start.getTime())) return null;
  return { start, end: new Date(start.getTime() + 24 * 3600 * 1000) };
}

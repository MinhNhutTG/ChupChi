import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';
import { thumb } from '../api/cloudinary';
import Nav from '../components/Nav';

const fmt = (n) => n.toLocaleString('vi-VN') + '₫';
const pad = (n) => String(n).padStart(2, '0');

// Ngày hiện tại theo giờ VN (UTC+7), khớp với cách backend nhóm ngày
function todayVN() {
  const d = new Date(Date.now() + 7 * 3600 * 1000);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

export default function Calendar() {
  const [{ year, month }, setYM] = useState(todayVN);
  const [days, setDays] = useState({});
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const loadMonth = useCallback(async () => {
    try {
      const { data } = await api.get('/transactions/calendar', { params: { year, month } });
      setDays(Object.fromEntries(data.map((d) => [d.date, d])));
    } catch {
      setError('Không tải được lịch');
    }
  }, [year, month]);

  const loadDay = useCallback(async (date) => {
    const { data } = await api.get('/transactions/day', { params: { date } });
    setItems(data);
  }, []);

  useEffect(() => {
    loadMonth();
    setSelected(null);
    setItems([]);
  }, [loadMonth]);

  const shift = (delta) => {
    const d = new Date(Date.UTC(year, month - 1 + delta, 1));
    setYM({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
  };

  const select = (date) => {
    setSelected(date);
    loadDay(date).catch(() => setError('Không tải được giao dịch'));
  };

  const remove = async (id) => {
    if (!window.confirm('Xoá giao dịch này?')) return;
    await api.delete(`/transactions/${id}`);
    await Promise.all([loadDay(selected), loadMonth()]);
  };

  const firstDow = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7; // T2 = 0
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthTotal = Object.values(days).reduce((s, d) => s + d.total, 0);

  return (
    <div className="page">
      <div className="head">
        <button className="secondary" onClick={() => shift(-1)}>‹</button>
        <strong>Tháng {month}/{year}</strong>
        <button className="secondary" onClick={() => shift(1)}>›</button>
      </div>
      <p className="muted">Tổng tháng: {fmt(monthTotal)}</p>
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
          <div key={d} className="dow">{d}</div>
        ))}
        {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} className="day empty" />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = `${year}-${pad(month)}-${pad(i + 1)}`;
          const info = days[date];
          return (
            <button key={date} className="day" onClick={() => select(date)} style={selected === date ? { outline: '2px solid var(--accent)' } : undefined}>
              {info && <img src={thumb(info.images[0])} alt="" loading="lazy" />}
              <span>{i + 1}</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ marginTop: 20 }}>
          <h1 style={{ fontSize: 18 }}>
            {selected.split('-').reverse().join('/')} · {fmt(days[selected]?.total || 0)}
          </h1>
          {items.length === 0 && <p className="muted">Chưa có giao dịch.</p>}
          {items.map((t) => (
            <div key={t._id} className="tx">
              <img src={thumb(t.imageUrl, 112)} alt="" />
              <div className="info">
                <strong>{fmt(t.amount)}</strong>
                <div className="muted">{t.categoryId?.icon} {t.categoryId?.name}{t.label ? ` · ${t.label}` : ''}</div>
              </div>
              <button className="danger" onClick={() => remove(t._id)}>Xoá</button>
            </div>
          ))}
        </div>
      )}
      <Nav />
    </div>
  );
}

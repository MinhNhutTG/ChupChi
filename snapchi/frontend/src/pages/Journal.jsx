import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/client';
import { compressImage, thumb, uploadImage } from '../api/cloudinary';
import { MONTH_LABEL, fmt, fmtDate, pad, vnDateKey, vnParts } from '../api/format';
import { CameraIcon, ChevronLeft, ChevronRight } from '../components/Icons';
import Modal from '../components/Modal';
import { useCategories } from '../context/CategoriesContext';
import { useToast } from '../context/ToastContext';

export default function Journal() {
  const { byId } = useCategories();
  const showToast = useToast();
  const [{ year, month }, setYM] = useState(() => vnParts());
  const [data, setData] = useState({ days: [], byCategory: [], total: 0 });
  const [dayKey, setDayKey] = useState(null); // ngày đang mở danh sách
  const [dayItems, setDayItems] = useState([]);
  const [detail, setDetail] = useState(null); // giao dịch đang xem chi tiết
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const loadMonth = useCallback(async () => {
    try {
      const { data: d } = await api.get('/transactions/calendar', { params: { year, month } });
      setData(d);
    } catch {
      showToast('Không tải được lịch', { error: true });
    }
  }, [year, month, showToast]);

  const loadDay = useCallback(
    async (key) => {
      try {
        const { data: items } = await api.get('/transactions/day', { params: { date: key } });
        setDayItems(items);
        return items;
      } catch {
        showToast('Không tải được giao dịch', { error: true });
        return [];
      }
    },
    [showToast]
  );

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  const shift = (delta) => {
    const d = new Date(Date.UTC(year, month - 1 + delta, 1));
    setYM({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
  };

  const openDay = async (key) => {
    setDayKey(key);
    setDayItems([]);
    loadDay(key);
  };

  // Sau khi sửa/xoá: tải lại tháng và danh sách ngày; hết giao dịch thì đóng danh sách
  const refresh = async () => {
    await loadMonth();
    if (dayKey) {
      const items = await loadDay(dayKey);
      if (!items.length) setDayKey(null);
    }
  };

  const remove = async () => {
    if (!window.confirm('Xoá giao dịch này?')) return;
    setBusy(true);
    try {
      await api.delete(`/transactions/${detail._id}`);
      setDetail(null);
      await refresh();
    } catch (err) {
      showToast(err.response?.data?.message || 'Xoá thất bại', { error: true });
    } finally {
      setBusy(false);
    }
  };

  const changeImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !detail) return;
    setBusy(true);
    try {
      const image = await uploadImage(await compressImage(file));
      const { data: tx } = await api.put(`/transactions/${detail._id}`, image);
      setDetail((d) => ({ ...d, imageUrl: tx.imageUrl }));
      showToast('Đã cập nhật ảnh');
      await refresh();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Đổi ảnh thất bại', { error: true });
    } finally {
      setBusy(false);
    }
  };

  // ---- Lịch ----
  const firstDow = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7; // T2 = 0
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const perDay = Object.fromEntries(data.days.map((d) => [d.date, d]));
  const today = vnParts();
  const todayKey = vnDateKey(today);

  const top = [...data.byCategory].sort((a, b) => b.total - a.total)[0];
  const topName = top && byId[top.categoryId]?.name;

  const dayTotal = dayItems.reduce((s, t) => s + t.amount, 0);
  const dayNum = dayKey && Number(dayKey.split('-')[2]);
  const dayMonth = dayKey && Number(dayKey.split('-')[1]);

  return (
    <div className="screen">
      <div className="feed-header"><h1>Nhật ký chi tiêu</h1></div>
      <div className="feed-summary">
        <div>
          <div className="fs-label">Tổng chi {month === today.month && year === today.year ? 'tháng này' : MONTH_LABEL[month - 1].toLowerCase()}</div>
          <div className="fs-amount">{fmt(data.total)}</div>
        </div>
        <div className="fs-badge">{topName ? `Nhiều nhất: ${topName}` : '—'}</div>
      </div>

      <div className="feed-scroll">
        <div className="cal-nav">
          <button onClick={() => shift(-1)} aria-label="Tháng trước"><ChevronLeft width={14} height={14} /></button>
          <div className="cal-month-label">{MONTH_LABEL[month - 1]}, {year}</div>
          <button onClick={() => shift(1)} aria-label="Tháng sau"><ChevronRight width={14} height={14} /></button>
        </div>
        <div className="cal-weekdays">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="cal-grid">
          {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} className="cal-cell empty" />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const key = `${year}-${pad(month)}-${pad(i + 1)}`;
            const info = perDay[key];
            const cls = `cal-cell ${info ? 'has-spend' : ''} ${key === todayKey ? 'is-today' : ''}`;
            const content = (
              <>
                <div className="day-num">{i + 1}</div>
                {info && (
                  <div className={`cal-photos ${info.count > 1 ? 'split' : ''}`}>
                    {info.images.slice(0, 2).map((src, j) => <img key={j} src={thumb(src)} alt="" loading="lazy" />)}
                  </div>
                )}
                {info?.count > 2 && <div className="cal-more-badge">+{info.count - 2}</div>}
              </>
            );
            return info ? (
              <button key={key} className={cls} onClick={() => openDay(key)} aria-label={`Ngày ${i + 1}, ${info.count} giao dịch`}>
                {content}
              </button>
            ) : (
              <div key={key} className={cls}>{content}</div>
            );
          })}
        </div>
        {data.days.length === 0 && (
          <div className="empty-hint">
            Chưa có giao dịch nào trong tháng này.<br />Bấm nút <CameraIcon width={14} height={14} style={{ verticalAlign: '-2px' }} /> để bắt đầu ghi lại nhé!
          </div>
        )}
      </div>

      {dayKey && !detail && (
        <Modal onClose={() => setDayKey(null)}>
          <div className="modal-content" style={{ paddingTop: 22 }}>
            <div className="modal-amt">Ngày {dayNum} tháng {dayMonth}</div>
            <div className="modal-meta">Tổng chi: {fmt(dayTotal)} · {dayItems.length} giao dịch</div>
          </div>
          <div className="day-modal-list">
            {dayItems.map((t) => {
              const c = t.categoryId;
              return (
                <button key={t._id} className="day-item" onClick={() => setDetail(t)}>
                  <div className="di-thumb"><img src={thumb(t.imageUrl, 100)} alt="" /></div>
                  <div className="di-info">
                    <div className="di-label">{t.label || c?.name}</div>
                    <div className="di-cat" style={{ color: c?.color }}>{c?.name}</div>
                  </div>
                  <div className="di-amt">{fmt(t.amount)}</div>
                </button>
              );
            })}
          </div>
          <div className="modal-content">
            <div className="modal-actions"><button className="btn-close2" onClick={() => setDayKey(null)}>Đóng</button></div>
          </div>
        </Modal>
      )}

      {detail && (
        <Modal onClose={() => !busy && setDetail(null)}>
          <div className="modal-photo">
            <img src={thumb(detail.imageUrl, 800)} alt="Ảnh giao dịch" />
            <button className="change-photo" onClick={() => fileRef.current?.click()} disabled={busy}>
              <CameraIcon width={13} height={13} /> {busy ? 'Đang xử lý…' : 'Đổi ảnh'}
            </button>
          </div>
          <div className="modal-content">
            <div className="modal-amt">{fmt(detail.amount)}</div>
            <div className="modal-meta">{detail.label || detail.categoryId?.name} · {fmtDate(detail.transactionDate)}</div>
            <span className="modal-tag" style={{ background: detail.categoryId?.color }}>{detail.categoryId?.name}</span>
            <div className="modal-actions">
              <button className="btn-delete" onClick={remove} disabled={busy}>Xoá</button>
              <button className="btn-close2" onClick={() => setDetail(null)} disabled={busy}>Đóng</button>
            </div>
          </div>
        </Modal>
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={changeImage} />
    </div>
  );
}

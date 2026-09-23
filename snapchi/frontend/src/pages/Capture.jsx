import { useCallback, useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/client';
import { captureSquare, compressImage, uploadImage } from '../api/cloudinary';
import { fmt, vnParts } from '../api/format';
import { FlipIcon, PencilIcon } from '../components/Icons';
import { useCategories } from '../context/CategoriesContext';
import { useToast } from '../context/ToastContext';

const MIN_AMOUNT = 1000;

export default function Capture() {
  const { registerCapture } = useOutletContext();
  const { categories } = useCategories();
  const showToast = useToast();

  const [catId, setCatId] = useState('');
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);
  const [facing, setFacing] = useState('environment');
  const [cam, setCam] = useState('starting'); // starting | live | off
  const [monthTotal, setMonthTotal] = useState(0);

  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const amountRef = useRef(null);

  // Chọn sẵn danh mục đầu tiên; chọn lại nếu danh mục đang chọn đã bị xoá
  useEffect(() => {
    if (categories.length && !categories.some((c) => c._id === catId)) setCatId(categories[0]._id);
  }, [categories, catId]);

  const loadTotal = useCallback(() => {
    const { year, month } = vnParts();
    api
      .get('/transactions/calendar', { params: { year, month } })
      .then(({ data }) => setMonthTotal(data.total))
      .catch(() => {});
  }, []);
  useEffect(loadTotal, [loadTotal]);

  // Camera trực tiếp; không có quyền/không hỗ trợ thì chuyển sang chọn ảnh từ máy
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCam('off');
      return undefined;
    }
    let cancelled = false;
    let stream;
    setCam('starting');
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1280 } }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        const v = videoRef.current;
        v.srcObject = s;
        return v.play().then(() => !cancelled && setCam('live'));
      })
      .catch(() => !cancelled && setCam('off'));
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  // Trả về số tiền hợp lệ, hoặc null (rung ô nhập + báo lỗi, không mở camera)
  const validateAmount = () => {
    const n = parseInt(amount, 10);
    if (!n || n < MIN_AMOUNT) {
      amountRef.current?.focus();
      setShake(false);
      requestAnimationFrame(() => setShake(true));
      showToast('Giá tiền tối thiểu 1.000₫', { error: true });
      return null;
    }
    return n;
  };

  const save = async (blob, n) => {
    setBusy(true);
    try {
      const image = blob ? await uploadImage(blob) : {};
      const name = categories.find((c) => c._id === catId)?.name || '';
      const finalLabel = label.trim() || name;
      await api.post('/transactions', {
        amount: n,
        categoryId: catId,
        label: finalLabel,
        transactionDate: new Date().toISOString(),
        ...image,
      });
      setAmount('');
      setLabel('');
      showToast(`Đã lưu ✓ ${fmt(n)} · ${finalLabel}`);
      loadTotal();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Lưu thất bại', { error: true });
    } finally {
      setBusy(false);
    }
  };

  // Nút FAB ở thanh điều hướng gọi hàm này khi đang ở màn Chụp
  const shoot = async () => {
    if (busy) return;
    const n = validateAmount();
    if (n === null) return;
    const v = videoRef.current;
    if (cam === 'live' && v?.videoWidth) {
      try {
        await save(await captureSquare(v), n);
      } catch (err) {
        showToast(err.message, { error: true });
      }
    } else {
      fileRef.current?.click();
    }
  };

  useEffect(() => {
    registerCapture(shoot);
    return () => registerCapture(null);
  });

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || busy) return;
    const n = validateAmount();
    if (n === null) return;
    try {
      await save(await compressImage(file), n);
    } catch (err) {
      showToast(err.message, { error: true });
    }
  };

  const manualEntry = () => {
    if (busy) return;
    const n = validateAmount();
    if (n !== null) save(null, n);
  };

  return (
    <div className="screen cap-screen">
      <div className="cap-top">
        <div className="cap-brand">
          <div className="wordmark">Chụp Chi</div>
          <div className="cap-total">{fmt(monthTotal)} tháng này</div>
        </div>
      </div>

      <div className="cam-wrap">
        <div className="cam-block">
          <div className="viewfinder">
            <video
              ref={videoRef}
              playsInline
              muted
              className={facing === 'user' ? 'mirror' : ''}
              style={{ display: cam === 'live' ? 'block' : 'none' }}
            />
            <div className="vf-corner tl" /><div className="vf-corner tr" />
            <div className="vf-corner bl" /><div className="vf-corner br" />
            {cam !== 'live' && (
              <div className="vf-hint">
                {cam === 'starting' ? (
                  'Đang mở camera…'
                ) : (
                  <>Không mở được camera.<br />Bấm nút chụp để chọn ảnh từ máy.</>
                )}
              </div>
            )}
            {busy && <div className="vf-busy">Đang lưu…</div>}
          </div>

          <div className="quick-entry">
            <div className="cat-scroll" role="radiogroup" aria-label="Danh mục">
              {categories.map((c) => {
                const active = c._id === catId;
                return (
                  <button
                    key={c._id}
                    role="radio"
                    aria-checked={active}
                    className={`cat-chip ${active ? 'active' : ''}`}
                    style={active ? { background: c.color } : undefined}
                    onClick={() => setCatId(c._id)}
                  >
                    <span className="dot" style={{ background: active ? '#fff' : c.color }} />
                    {c.name}
                  </button>
                );
              })}
            </div>
            <div className={`quick-amount ${shake ? 'shake' : ''}`} onAnimationEnd={() => setShake(false)}>
              <span className="vnd">₫</span>
              <input
                ref={amountRef}
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="Nhập giá tiền trước khi chụp"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <input
              className="quick-label"
              type="text"
              maxLength={200}
              placeholder="Tên món (không bắt buộc)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="cap-bottom">
            <button
              className="side-btn"
              title="Đổi camera"
              aria-label="Đổi camera"
              disabled={cam !== 'live'}
              onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
            >
              <FlipIcon />
            </button>
            <span className="cap-hint">Bấm nút camera bên dưới để chụp</span>
            <button className="side-btn" title="Nhập tay (không chụp ảnh)" aria-label="Nhập tay" onClick={manualEntry}>
              <PencilIcon />
            </button>
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
    </div>
  );
}

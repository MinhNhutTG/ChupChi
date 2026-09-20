import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { compressImage, uploadImage } from '../api/cloudinary';

export default function Confirm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const file = state?.file;
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);
  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      setCategories(data);
      setCategoryId(data[0]?._id || '');
    });
  }, []);

  // F5 làm mất file đã chọn -> quay về trang chụp
  if (!file) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const blob = await compressImage(file);
      const image = await uploadImage(blob);
      await api.post('/transactions', {
        amount: Number(amount),
        categoryId,
        label,
        transactionDate: new Date().toISOString(),
        ...image,
      });
      navigate('/calendar', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lưu thất bại');
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <h1>Xác nhận</h1>
      <img className="preview" src={previewUrl} alt="Ảnh giao dịch" />
      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <input type="number" inputMode="numeric" min="0" placeholder="Số tiền (₫)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <input placeholder="Ghi chú (tuỳ chọn)" maxLength={200} value={label} onChange={(e) => setLabel(e.target.value)} />
        <div className="cats">
          {categories.map((c) => (
            <button type="button" key={c._id} className={`cat ${categoryId === c._id ? 'on' : ''}`} onClick={() => setCategoryId(c._id)}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        <button disabled={busy || !categoryId}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
        <button type="button" className="secondary" onClick={() => navigate('/')} disabled={busy}>Huỷ</button>
      </form>
    </div>
  );
}

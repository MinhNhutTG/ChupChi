import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token: params.get('token'), password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Không kết nối được máy chủ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <h1>Đặt lại mật khẩu</h1>
      {done ? (
        <p>
          Đã đặt lại mật khẩu. <Link to="/login">Đăng nhập</Link>
        </p>
      ) : (
        <form onSubmit={submit}>
          <input type="password" placeholder="Mật khẩu mới (tối thiểu 8 ký tự)" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="error">{error}</p>}
          <button disabled={busy}>{busy ? 'Đang lưu…' : 'Đặt lại mật khẩu'}</button>
        </form>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import AuthLayout from '../components/AuthLayout';

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
    <AuthLayout title="Đặt lại mật khẩu">
      {done ? (
        <>
          <div className="msg-box ok">Đã đặt lại mật khẩu.</div>
          <p className="auth-switch"><Link to="/login">Đăng nhập</Link></p>
        </>
      ) : (
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="password">Mật khẩu mới</label>
            <input id="password" type="password" placeholder="Tối thiểu 8 ký tự, có hoa/thường/số" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="msg-box err">{error}</div>}
          <button className="btn-primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Đặt lại mật khẩu'}</button>
        </form>
      )}
    </AuthLayout>
  );
}

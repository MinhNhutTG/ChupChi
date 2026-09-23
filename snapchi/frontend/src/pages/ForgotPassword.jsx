import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import AuthLayout from '../components/AuthLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Không kết nối được máy chủ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Quên mật khẩu" sub="Nhập email đã đăng ký, mình sẽ gửi liên kết đặt lại mật khẩu.">
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="ban@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {message && <div className="msg-box ok">{message}</div>}
        {error && <div className="msg-box err">{error}</div>}
        <button className="btn-primary" disabled={busy}>{busy ? 'Đang gửi…' : 'Gửi liên kết đặt lại'}</button>
      </form>
      <p className="auth-switch"><Link to="/login">← Quay lại đăng nhập</Link></p>
    </AuthLayout>
  );
}

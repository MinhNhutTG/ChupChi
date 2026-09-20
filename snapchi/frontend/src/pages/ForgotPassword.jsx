import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

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
    <div className="page">
      <h1>Quên mật khẩu</h1>
      {message ? (
        <p>{message}</p>
      ) : (
        <form onSubmit={submit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {error && <p className="error">{error}</p>}
          <button disabled={busy}>{busy ? 'Đang gửi…' : 'Gửi liên kết đặt lại'}</button>
        </form>
      )}
      <div className="links">
        <Link to="/login">Quay lại đăng nhập</Link>
      </div>
    </div>
  );
}

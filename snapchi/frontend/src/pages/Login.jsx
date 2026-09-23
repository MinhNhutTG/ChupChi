import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';
import AuthLayout, { GoogleButton } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const showToast = useToast();
  const [email, setEmail] = useState(state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unverified, setUnverified] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverified(false);
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setUnverified(err.response?.data?.code === 'EMAIL_NOT_VERIFIED');
      setError(err.response?.data?.message || 'Không kết nối được máy chủ');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    await api.post('/auth/resend-verification', { email }).catch(() => {});
    showToast('Đã gửi lại email xác thực');
    navigate('/verify', { state: { email } });
  };

  return (
    <AuthLayout title="Chào bạn quay lại" sub="Đăng nhập để tiếp tục ghi lại chi tiêu bằng ảnh.">
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="ban@email.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Mật khẩu</label>
          <input id="password" type="password" placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="forgot-link"><Link to="/forgot-password">Quên mật khẩu?</Link></div>
        {error && (
          <div className="msg-box err">
            {error}{' '}
            {unverified && <button type="button" className="link-accent" onClick={resend}>Gửi lại email</button>}
          </div>
        )}
        <button className="btn-primary" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      </form>

      <GoogleButton
        onCredential={(c) =>
          loginWithGoogle(c).catch((err) => setError(err.response?.data?.message || 'Đăng nhập Google thất bại'))
        }
        onError={() => setError('Đăng nhập Google thất bại')}
      />

      <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
    </AuthLayout>
  );
}

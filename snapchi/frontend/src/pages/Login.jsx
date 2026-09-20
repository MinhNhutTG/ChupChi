import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Không kết nối được máy chủ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <h1>Đăng nhập</h1>
      <form onSubmit={submit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <button disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      </form>
      <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={(r) =>
            loginWithGoogle(r.credential).catch((err) =>
              setError(err.response?.data?.message || 'Đăng nhập Google thất bại')
            )
          }
          onError={() => setError('Đăng nhập Google thất bại')}
        />
      </div>
      <div className="links">
        <Link to="/forgot-password">Quên mật khẩu?</Link>
        <Link to="/register">Tạo tài khoản</Link>
      </div>
    </div>
  );
}

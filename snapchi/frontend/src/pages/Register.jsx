import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout, { GoogleButton } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await register(name, email, password);
      // Đăng ký bằng email -> sang màn "Xác thực email", chưa vào app
      if (data.needsVerification) navigate('/verify', { state: { email: data.email }, replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Không kết nối được máy chủ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Tạo tài khoản mới" sub="Bắt đầu ghi chi tiêu bằng ảnh chỉ trong 1 phút.">
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="name">Họ tên</label>
          <input id="name" placeholder="Nguyễn Văn A" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="ban@email.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Mật khẩu</label>
          <input id="password" type="password" placeholder="Tối thiểu 8 ký tự, có hoa/thường/số" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div className="msg-box err">{error}</div>}
        <button className="btn-primary" disabled={busy}>{busy ? 'Đang tạo…' : 'Đăng ký'}</button>
      </form>

      <GoogleButton
        onCredential={(c) =>
          loginWithGoogle(c).catch((err) => setError(err.response?.data?.message || 'Đăng ký Google thất bại'))
        }
        onError={() => setError('Đăng ký Google thất bại')}
      />

      <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
    </AuthLayout>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
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
      await register(name, email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Không kết nối được máy chủ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <h1>Tạo tài khoản</h1>
      <form onSubmit={submit}>
        <input placeholder="Tên" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu (tối thiểu 8 ký tự)" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <button disabled={busy}>{busy ? 'Đang tạo…' : 'Đăng ký'}</button>
      </form>
      <div className="links">
        <Link to="/login">Đã có tài khoản</Link>
      </div>
    </div>
  );
}

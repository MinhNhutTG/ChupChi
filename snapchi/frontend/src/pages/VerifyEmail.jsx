import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import AuthLayout from '../components/AuthLayout';

// Trang đích của link trong email xác thực: /verify-email?token=...
export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | ok | fail
  const [message, setMessage] = useState('');
  const ran = useRef(false); // StrictMode gọi effect 2 lần, token chỉ dùng được 1 lần

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    api
      .post('/auth/verify-email', { token: params.get('token') })
      .then(() => setStatus('ok'))
      .catch((err) => {
        setMessage(err.response?.data?.message || 'Không kết nối được máy chủ');
        setStatus('fail');
      });
  }, [params]);

  return (
    <AuthLayout title="Xác thực email">
      {status === 'loading' && <p className="auth-sub">Đang xác thực…</p>}
      {status === 'ok' && (
        <>
          <div className="msg-box ok">Email đã được xác thực. Bạn có thể đăng nhập ngay.</div>
          <Link className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }} to="/login">Đăng nhập</Link>
        </>
      )}
      {status === 'fail' && (
        <>
          <div className="msg-box err">{message}</div>
          <p className="auth-switch"><Link to="/login">← Quay lại đăng nhập</Link></p>
        </>
      )}
    </AuthLayout>
  );
}

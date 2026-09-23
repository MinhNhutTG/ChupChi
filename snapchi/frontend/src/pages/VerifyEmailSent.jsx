import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';
import AuthLayout from '../components/AuthLayout';
import { useToast } from '../context/ToastContext';

// Màn "Xác thực email" hiện ngay sau khi đăng ký bằng email
export default function VerifyEmailSent() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const showToast = useToast();
  const [busy, setBusy] = useState(false);
  const email = state?.email;
  if (!email) return <Navigate to="/login" replace />;

  const resend = async () => {
    setBusy(true);
    try {
      await api.post('/auth/resend-verification', { email });
      showToast('Đã gửi lại email xác thực');
    } catch (err) {
      showToast(err.response?.data?.message || 'Không gửi được, thử lại sau', { error: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Xác thực email"
      sub={<>Chúng tôi đã gửi link xác thực tới <b>{email}</b>. Bấm vào link trong email để kích hoạt tài khoản trước khi sử dụng.</>}
    >
      <button className="btn-primary" onClick={() => navigate('/login', { state: { email } })}>
        Tôi đã xác thực xong
      </button>
      <button className="btn-secondary" onClick={resend} disabled={busy}>
        {busy ? 'Đang gửi…' : 'Gửi lại email xác thực'}
      </button>
      <p className="auth-switch"><Link to="/login">← Quay lại đăng nhập</Link></p>
    </AuthLayout>
  );
}

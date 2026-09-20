import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Capture from './pages/Capture';
import Confirm from './pages/Confirm';
import Calendar from './pages/Calendar';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center">Đang tải… (lần đầu có thể mất ~30 giây)</p>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center">Đang tải…</p>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Protected><Capture /></Protected>} />
      <Route path="/confirm" element={<Protected><Confirm /></Protected>} />
      <Route path="/calendar" element={<Protected><Calendar /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

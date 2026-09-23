import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { CategoriesProvider } from './context/CategoriesContext';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Account from './pages/Account';
import Capture from './pages/Capture';
import Categories from './pages/Categories';
import ForgotPassword from './pages/ForgotPassword';
import Journal from './pages/Journal';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import VerifyEmailSent from './pages/VerifyEmailSent';

// Chờ silent refresh xong mới quyết định cho vào app hay về trang đăng nhập
function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-msg">Đang tải…<br />(lần đầu có thể mất ~30 giây)</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <CategoriesProvider>
      <Outlet />
    </CategoriesProvider>
  );
}

function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-msg">Đang tải…</div>;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

export default function App() {
  return (
    <div className="device">
      <ToastProvider>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<VerifyEmailSent />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          {/* Mở từ link trong email nên không phụ thuộc trạng thái đăng nhập */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<Protected />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Capture />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/account" element={<Account />} />
            </Route>
            <Route path="/account/categories" element={<Categories />} />
          </Route>

          <Route path="/calendar" element={<Navigate to="/journal" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </div>
  );
}

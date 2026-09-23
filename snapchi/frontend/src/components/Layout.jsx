import { useCallback, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import TabBar from './TabBar';

// Khung có thanh điều hướng. Màn Chụp đăng ký hàm chụp qua registerCapture để nút FAB gọi được.
export default function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const captureRef = useRef(null);
  const registerCapture = useCallback((fn) => { captureRef.current = fn; }, []);

  const onFab = () => {
    if (pathname === '/') captureRef.current?.();
    else navigate('/');
  };

  return (
    <>
      <Outlet context={{ registerCapture }} />
      <TabBar onFab={onFab} />
    </>
  );
}

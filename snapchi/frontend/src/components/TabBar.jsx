import { NavLink } from 'react-router-dom';
import { CalendarIcon, CameraIcon, UserIcon } from './Icons';

// Nút FAB giữa: đang ở màn khác -> vào màn Chụp; đang ở màn Chụp -> chụp ảnh thật (onFab xử lý)
export default function TabBar({ onFab, fabDisabled }) {
  const cls = ({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`;
  return (
    <nav className="tabbar">
      <NavLink to="/journal" className={cls}>
        <CalendarIcon /> Nhật ký
      </NavLink>
      <button className="tab-fab-wrap" onClick={onFab} disabled={fabDisabled} aria-label="Chụp">
        <span className="tab-fab"><CameraIcon /></span>
      </button>
      <NavLink to="/account" className={cls}>
        <UserIcon /> Tài khoản
      </NavLink>
    </nav>
  );
}

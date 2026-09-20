import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Nav() {
  const { logout } = useAuth();
  return (
    <nav className="nav">
      <Link className="btn secondary" to="/">📷 Chụp</Link>
      <Link className="btn secondary" to="/calendar">🗓 Lịch</Link>
      <button className="secondary" onClick={logout}>Thoát</button>
    </nav>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { initials } from '../api/format';
import { ChevronRight, CloseIcon } from '../components/Icons';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();
  const [pwOpen, setPwOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/auth/change-password', { currentPassword: current, newPassword: next });
      setPwOpen(false);
      setCurrent('');
      setNext('');
      showToast('Đã đổi mật khẩu');
    } catch (err) {
      setError(err.response?.data?.message || 'Không kết nối được máy chủ');
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    const ok = window.confirm(
      'Xoá tài khoản? Dữ liệu sẽ được xoá vĩnh viễn sau 24 giờ, bạn có thể huỷ yêu cầu trong thời gian đó bằng cách đăng nhập lại.'
    );
    if (!ok) return;
    try {
      await api.post('/auth/delete-account');
      await logout();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không gửi được yêu cầu', { error: true });
    }
  };

  return (
    <div className="screen acc-screen">
      <button className="round-btn acc-close" onClick={() => navigate('/journal')} aria-label="Đóng">
        <CloseIcon />
      </button>
      <div className="acc-top">
        <div className="acc-avatar">
          {user.avatarUrl ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" /> : initials(user.name)}
        </div>
        <div>
          <div className="acc-name">{user.name}</div>
          <div className="acc-email">{user.email}</div>
        </div>
      </div>

      <div className="acc-list">
        <button className="acc-row" onClick={() => navigate('/account/categories')}>
          Quản lý danh mục <ChevronRight width={16} height={16} />
        </button>
        {user.hasPassword && (
          <button className="acc-row" onClick={() => { setError(''); setPwOpen(true); }}>
            Đổi mật khẩu <ChevronRight width={16} height={16} />
          </button>
        )}
        <div className="acc-row" style={{ cursor: 'default' }}>
          Liên kết Google <span className="soft">{user.googleLinked ? 'Đã bật' : 'Chưa liên kết'}</span>
        </div>
        <button className="acc-row danger" onClick={logout}>Đăng xuất</button>
        <button className="acc-row danger" onClick={deleteAccount}>Xoá tài khoản</button>
      </div>

      {pwOpen && (
        <Modal onClose={() => !busy && setPwOpen(false)}>
          <form className="modal-content" style={{ paddingTop: 24 }} onSubmit={changePassword}>
            <h2 className="sheet-title">Đổi mật khẩu</h2>
            <div className="field">
              <label htmlFor="cur">Mật khẩu hiện tại</label>
              <input id="cur" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="new">Mật khẩu mới</label>
              <input id="new" type="password" autoComplete="new-password" placeholder="Tối thiểu 8 ký tự, có hoa/thường/số" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required />
            </div>
            {error && <div className="msg-box err">{error}</div>}
            <div className="modal-actions">
              <button type="button" className="btn-delete" style={{ background: 'var(--paper-deep)', color: 'var(--ink-soft)' }} onClick={() => setPwOpen(false)} disabled={busy}>Huỷ</button>
              <button className="btn-close2" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

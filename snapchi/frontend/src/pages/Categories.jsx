import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ChevronLeft, CloseIcon } from '../components/Icons';
import { useCategories } from '../context/CategoriesContext';
import { useToast } from '../context/ToastContext';

const PALETTE = ['#B4654A', '#4E6E8C', '#7A5A8A', '#5C7A50', '#7C7566', '#2F6FED', '#B08A2E', '#C9A227', '#3E8E7E', '#A24E6B'];

export default function Categories() {
  const { categories, reload } = useCategories();
  const navigate = useNavigate();
  const showToast = useToast();
  const [editing, setEditing] = useState(null); // id | '__new__' | null
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [busy, setBusy] = useState(false);

  const start = (c) => {
    setEditing(c ? c._id : '__new__');
    setName(c ? c.name : '');
    setColor(c ? c.color : PALETTE[0]);
  };

  const save = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      if (editing === '__new__') await api.post('/categories', { name, color });
      else await api.put(`/categories/${editing}`, { name, color });
      await reload();
      setEditing(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Lưu thất bại', { error: true });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Xoá danh mục "${c.name}"? Các giao dịch cũ thuộc danh mục này sẽ chuyển sang "Khác".`)) return;
    try {
      await api.delete(`/categories/${c._id}`);
      await reload();
    } catch (err) {
      showToast(err.response?.data?.message || 'Xoá thất bại', { error: true });
    }
  };

  const editBox = (
    <div className="catmgmt-edit-box">
      <input
        autoFocus
        placeholder="Tên danh mục"
        maxLength={40}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && save()}
      />
      <div className="color-swatch-row">
        {PALETTE.map((hex) => (
          <button
            key={hex}
            className={`color-swatch ${hex === color ? 'selected' : ''}`}
            style={{ background: hex }}
            aria-label={`Màu ${hex}`}
            onClick={() => setColor(hex)}
          />
        ))}
      </div>
      <div className="catmgmt-edit-actions">
        <button className="btn-cat-cancel" onClick={() => setEditing(null)}>Huỷ</button>
        <button className="btn-cat-save" onClick={save} disabled={busy}>Lưu</button>
      </div>
    </div>
  );

  return (
    <div className="screen">
      <div className="catmgmt-top">
        <button className="round-btn" onClick={() => navigate('/account')} aria-label="Quay lại"><ChevronLeft /></button>
        <h1>Quản lý danh mục</h1>
      </div>
      <div className="catmgmt-list">
        {categories.map((c) =>
          editing === c._id ? (
            <div key={c._id}>{editBox}</div>
          ) : (
            <div key={c._id} className="catmgmt-row">
              <button className="catmgmt-dot" style={{ background: c.color }} onClick={() => start(c)} aria-label={`Sửa ${c.name}`} />
              <button className="catmgmt-name" onClick={() => start(c)}>{c.name}</button>
              <button
                className="catmgmt-del"
                disabled={c.isProtected}
                title={c.isProtected ? 'Không thể xoá danh mục này' : 'Xoá danh mục'}
                aria-label={`Xoá ${c.name}`}
                onClick={() => remove(c)}
              >
                <CloseIcon />
              </button>
            </div>
          )
        )}
        {editing === '__new__' ? editBox : (
          <button className="catmgmt-add-btn" onClick={() => start(null)}>+ Thêm danh mục</button>
        )}
      </div>
    </div>
  );
}

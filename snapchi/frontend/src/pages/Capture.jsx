import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';

export default function Capture() {
  const navigate = useNavigate();
  const camera = useRef();
  const gallery = useRef();

  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (file) navigate('/confirm', { state: { file } });
  };

  return (
    <div className="page">
      <h1>Chụp chi tiêu</h1>
      <p className="muted">Chụp 1 tấm ảnh, rồi nhập số tiền và chọn danh mục.</p>
      <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
        <button onClick={() => camera.current.click()}>📷 Chụp ảnh</button>
        <button className="secondary" onClick={() => gallery.current.click()}>🖼 Chọn từ thư viện</button>
      </div>
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={onPick} />
      <input ref={gallery} type="file" accept="image/*" hidden onChange={onPick} />
      <Nav />
    </div>
  );
}

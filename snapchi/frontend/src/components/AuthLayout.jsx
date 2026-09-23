import { GoogleLogin } from '@react-oauth/google';

export default function AuthLayout({ title, sub, children }) {
  return (
    <div className="screen auth-screen">
      <div className="auth-top"><span className="auth-mark">Chụp Chi</span></div>
      <h1 className="auth-title">{title}</h1>
      {sub && <p className="auth-sub">{sub}</p>}
      {children}
    </div>
  );
}

export function GoogleButton({ onCredential, onError }) {
  return (
    <>
      <div className="divider-row">hoặc</div>
      <div className="google-wrap">
        <GoogleLogin
          width="300"
          text="continue_with"
          locale="vi"
          onSuccess={(r) => onCredential(r.credential)}
          onError={onError}
        />
      </div>
    </>
  );
}

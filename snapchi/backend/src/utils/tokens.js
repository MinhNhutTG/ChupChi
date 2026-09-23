import jwt from 'jsonwebtoken';

export const signAccessToken = (userId) =>
  jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, { expiresIn: '15m' });

export const signRefreshToken = (userId) =>
  jwt.sign({ sub: String(userId) }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

export const REFRESH_COOKIE = 'refreshToken';

// Frontend (Vercel) và backend (Render) khác domain nên luôn cần SameSite=None; Secure
// để trình duyệt gửi lại cookie trên request cross-site (kể cả khi NODE_ENV chưa được set
// đúng trên host). Secure vẫn hoạt động ở localhost vì trình duyệt coi đó là secure context.
export const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 30 * 24 * 3600 * 1000,
  path: '/api/auth',
};

import jwt from 'jsonwebtoken';

const isProd = process.env.NODE_ENV === 'production';

export const signAccessToken = (userId) =>
  jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, { expiresIn: '15m' });

export const signRefreshToken = (userId) =>
  jwt.sign({ sub: String(userId) }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

export const REFRESH_COOKIE = 'refreshToken';

// Cross-domain (Vercel <-> Render) cần SameSite=None; Secure
export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 30 * 24 * 3600 * 1000,
  path: '/api/auth',
};

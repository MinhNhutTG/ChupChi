import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { Resend } from 'resend';
import User from '../models/User.js';
import {
  signAccessToken,
  signRefreshToken,
  REFRESH_COOKIE,
  refreshCookieOptions,
} from '../utils/tokens.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

const publicUser = (u) => ({ id: u._id, email: u.email, name: u.name, avatarUrl: u.avatarUrl });

function issueSession(res, user) {
  res.cookie(REFRESH_COOKIE, signRefreshToken(user._id), refreshCookieOptions);
  return res.json({ accessToken: signAccessToken(user._id), user: publicUser(user) });
}

export async function register(req, res) {
  const { email, password, name } = req.body;
  if (!EMAIL_RE.test(email || '')) return res.status(400).json({ message: 'Email không hợp lệ' });
  if (!password || password.length < 8)
    return res.status(400).json({ message: 'Mật khẩu tối thiểu 8 ký tự' });
  if (!name?.trim()) return res.status(400).json({ message: 'Vui lòng nhập tên' });

  if (await User.exists({ email: email.toLowerCase() }))
    return res.status(409).json({ message: 'Email đã được đăng ký' });

  const user = await User.create({
    email,
    name,
    passwordHash: await bcrypt.hash(password, 12),
  });
  issueSession(res.status(201), user);
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  // Cùng một thông báo cho mọi trường hợp sai để không lộ email nào đã đăng ký
  if (!user?.passwordHash || !(await bcrypt.compare(password || '', user.passwordHash)))
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  issueSession(res, user);
}

export async function google(req, res) {
  const { idToken } = req.body;
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: 'Google token không hợp lệ' });
  }
  if (!payload?.email_verified)
    return res.status(401).json({ message: 'Email Google chưa được xác minh' });

  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }],
  });
  if (!user) {
    user = await User.create({
      email: payload.email,
      name: payload.name || payload.email,
      googleId: payload.sub,
      avatarUrl: payload.picture || null,
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    if (!user.avatarUrl) user.avatarUrl = payload.picture || null;
    await user.save();
  }
  issueSession(res, user);
}

export async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) return res.status(401).json({ message: 'Chưa đăng nhập' });
  try {
    const { sub } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(sub);
    if (!user) return res.status(401).json({ message: 'Tài khoản không tồn tại' });
    res.json({ accessToken: signAccessToken(user._id), user: publicUser(user) });
  } catch {
    res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn' });
  }
}

export function logout(req, res) {
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions, maxAge: undefined });
  res.json({ message: 'Đã đăng xuất' });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  // Luôn trả cùng một kết quả để không lộ email nào tồn tại
  const ok = { message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.' };
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user?.passwordHash) return res.json(ok); // tài khoản Google không có mật khẩu

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = sha256(token);
  user.resetPasswordExpires = new Date(Date.now() + 3600 * 1000);
  await user.save();

  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.MAIL_FROM,
      to: user.email,
      subject: 'Đặt lại mật khẩu SnapChi',
      html: `<p>Bấm vào liên kết để đặt lại mật khẩu (hết hạn sau 1 giờ):</p><p><a href="${link}">${link}</a></p>`,
    });
  } catch (err) {
    console.error('Gửi email thất bại:', err.message);
  }
  res.json(ok);
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!password || password.length < 8)
    return res.status(400).json({ message: 'Mật khẩu tối thiểu 8 ký tự' });
  const user = await User.findOne({
    resetPasswordToken: sha256(token || ''),
    resetPasswordExpires: { $gt: new Date() },
  });
  if (!user) return res.status(400).json({ message: 'Liên kết không hợp lệ hoặc đã hết hạn' });

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
  res.json({ message: 'Đã đặt lại mật khẩu' });
}

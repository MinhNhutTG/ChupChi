import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { ensureUserCategories } from '../utils/categories.js';
import { sendMail } from '../utils/mailer.js';
import { validPassword, PASSWORD_MESSAGE } from '../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  REFRESH_COOKIE,
  refreshCookieOptions,
} from '../utils/tokens.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

// Chỉ bật khi Resend đã verify domain riêng (domain test chỉ gửi được tới email chủ tài khoản)
const requireVerification = () => process.env.REQUIRE_EMAIL_VERIFICATION === 'true';

const publicUser = (u) => ({
  id: u._id,
  email: u.email,
  name: u.name,
  avatarUrl: u.avatarUrl,
  hasPassword: !!u.passwordHash,
  googleLinked: !!u.googleId,
});

function issueSession(res, user) {
  res.cookie(REFRESH_COOKIE, signRefreshToken(user._id), refreshCookieOptions);
  return res.json({ accessToken: signAccessToken(user._id), user: publicUser(user) });
}

async function sendVerificationEmail(user) {
  const token = crypto.randomBytes(32).toString('hex');
  user.verifyToken = sha256(token);
  user.verifyExpires = new Date(Date.now() + 24 * 3600 * 1000);
  await user.save();
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendMail({
    to: user.email,
    subject: 'Xác thực email Chụp Chi',
    html: `<p>Bấm vào liên kết để xác thực email (hết hạn sau 24 giờ):</p><p><a href="${link}">${link}</a></p>`,
  });
}

// Đăng nhập lại trong vòng 24 giờ sẽ huỷ yêu cầu xoá tài khoản
async function cancelDeletion(user) {
  if (user.deletionRequestedAt) {
    user.deletionRequestedAt = null;
    await user.save();
  }
}

export async function register(req, res) {
  const { email, password, name } = req.body;
  if (!EMAIL_RE.test(email || '')) return res.status(400).json({ message: 'Email không hợp lệ' });
  if (!validPassword(password)) return res.status(400).json({ message: PASSWORD_MESSAGE });
  if (!name?.trim()) return res.status(400).json({ message: 'Vui lòng nhập tên' });

  if (await User.exists({ email: email.toLowerCase() }))
    return res.status(409).json({ message: 'Email đã được đăng ký' });

  const user = await User.create({
    email,
    name,
    passwordHash: await bcrypt.hash(password, 12),
    emailVerified: !requireVerification(),
  });
  await ensureUserCategories(user._id);

  if (requireVerification()) {
    await sendVerificationEmail(user);
    return res.status(201).json({ needsVerification: true, email: user.email });
  }
  issueSession(res.status(201), user);
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  // Cùng một thông báo cho mọi trường hợp sai để không lộ email nào đã đăng ký
  if (!user?.passwordHash || !(await bcrypt.compare(password || '', user.passwordHash)))
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  if (user.emailVerified === false)
    return res.status(403).json({
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư.',
    });
  await cancelDeletion(user);
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
      emailVerified: true, // Google đã xác thực email
    });
  } else {
    if (!user.googleId) user.googleId = payload.sub;
    if (!user.avatarUrl) user.avatarUrl = payload.picture || null;
    user.emailVerified = true;
    await user.save();
  }
  await ensureUserCategories(user._id);
  await cancelDeletion(user);
  issueSession(res, user);
}

export async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) return res.status(401).json({ message: 'Chưa đăng nhập' });
  try {
    const { sub } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(sub);
    if (!user || user.deletionRequestedAt)
      return res.status(401).json({ message: 'Tài khoản không khả dụng' });
    res.json({ accessToken: signAccessToken(user._id), user: publicUser(user) });
  } catch {
    res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn' });
  }
}

export function logout(req, res) {
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions, maxAge: undefined });
  res.json({ message: 'Đã đăng xuất' });
}

export async function verifyEmail(req, res) {
  const user = await User.findOne({
    verifyToken: sha256(req.body.token || ''),
    verifyExpires: { $gt: new Date() },
  });
  if (!user) return res.status(400).json({ message: 'Liên kết không hợp lệ hoặc đã hết hạn' });
  user.emailVerified = true;
  user.verifyToken = null;
  user.verifyExpires = null;
  await user.save();
  res.json({ message: 'Đã xác thực email' });
}

export async function resendVerification(req, res) {
  const ok = { message: 'Nếu tài khoản cần xác thực, chúng tôi đã gửi lại email.' };
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (user?.emailVerified === false) await sendVerificationEmail(user);
  res.json(ok);
}

export async function forgotPassword(req, res) {
  // Luôn trả cùng một kết quả để không lộ email nào tồn tại
  const ok = { message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.' };
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user?.passwordHash) return res.json(ok); // tài khoản Google không có mật khẩu

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = sha256(token);
  user.resetPasswordExpires = new Date(Date.now() + 3600 * 1000);
  await user.save();

  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: 'Đặt lại mật khẩu Chụp Chi',
    html: `<p>Bấm vào liên kết để đặt lại mật khẩu (hết hạn sau 1 giờ):</p><p><a href="${link}">${link}</a></p>`,
  });
  res.json(ok);
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!validPassword(password)) return res.status(400).json({ message: PASSWORD_MESSAGE });
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

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.userId);
  if (!user?.passwordHash)
    return res.status(400).json({ message: 'Tài khoản này đăng nhập bằng Google, chưa có mật khẩu' });
  if (!(await bcrypt.compare(currentPassword || '', user.passwordHash)))
    return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
  if (!validPassword(newPassword)) return res.status(400).json({ message: PASSWORD_MESSAGE });

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ message: 'Đã đổi mật khẩu' });
}

export async function deleteAccount(req, res) {
  await User.updateOne({ _id: req.userId }, { deletionRequestedAt: new Date() });
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions, maxAge: undefined });
  res.json({ message: 'Tài khoản sẽ bị xoá sau 24 giờ. Đăng nhập lại để huỷ.' });
}

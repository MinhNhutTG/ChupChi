import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import requireAuth from '../middlewares/auth.middleware.js';
import * as c from '../controllers/auth.controller.js';

const router = Router();

const limiter = (max) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' },
  });

router.post('/register', limiter(20), c.register);
router.post('/login', limiter(10), c.login);
router.post('/google', limiter(30), c.google);
router.post('/verify-email', limiter(20), c.verifyEmail);
router.post('/resend-verification', limiter(5), c.resendVerification);
router.post('/forgot-password', limiter(5), c.forgotPassword);
router.post('/reset-password', limiter(10), c.resetPassword);
router.post('/refresh', c.refresh);
router.post('/logout', c.logout);

// Cần đăng nhập
router.post('/change-password', requireAuth, limiter(10), c.changePassword);
router.post('/delete-account', requireAuth, limiter(5), c.deleteAccount);

export default router;

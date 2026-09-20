import { Router } from 'express';
import rateLimit from 'express-rate-limit';
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
router.post('/forgot-password', limiter(5), c.forgotPassword);
router.post('/reset-password', limiter(10), c.resetPassword);
router.post('/refresh', c.refresh);
router.post('/logout', c.logout);

export default router;

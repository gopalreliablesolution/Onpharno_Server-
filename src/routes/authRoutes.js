import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, getMe, refreshToken, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

router.post('/login', loginLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;

import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendTokenResponse, generateAccessToken, getCookieOptions } from '../utils/token.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

// @desc    Login Admin User
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password +loginAttempts +lockUntil +active');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    if (user.active === false) {
      return res.status(403).json({ success: false, message: 'Account is inactive.' });
    }

    if (user.isLocked && user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to repeated failed attempts. Please try again later.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
        user.loginAttempts = 0;
      }
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Logged in User
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Token
// @route   POST /api/v1/auth/refresh
// @access  Public
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error('Missing JWT_REFRESH_SECRET');
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.active === false) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
    }

    const newAccessToken = generateAccessToken(user);
    res.cookie('token', newAccessToken, getCookieOptions(15 * 60 * 1000));
    res.status(200).json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is expired or invalid',
    });
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Public
export const logout = async (req, res) => {
  const base = { ...getCookieOptions(0), maxAge: 0, expires: new Date(0) };
  res.cookie('token', '', base);
  res.cookie('refreshToken', '', base);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

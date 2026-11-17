import jwt from 'jsonwebtoken';

const requireSecret = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    requireSecret('JWT_SECRET'),
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    requireSecret('JWT_REFRESH_SECRET'),
    { expiresIn: '7d' }
  );
};

export const getCookieOptions = (maxAgeMs) => {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = (process.env.COOKIE_SAMESITE || (isProd ? 'none' : 'lax')).toLowerCase();
  const secure = isProd ? true : String(process.env.COOKIE_SECURE || '').toLowerCase() === 'true';
  const domain = process.env.COOKIE_DOMAIN || undefined;
  const opts = {
    httpOnly: true,
    secure: sameSite === 'none' ? true : secure,
    sameSite,
    maxAge: maxAgeMs,
    path: '/',
  };
  if (domain) opts.domain = domain;
  return opts;
};

export const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie('token', accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  res.status(statusCode).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

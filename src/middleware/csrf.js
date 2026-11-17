const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const getAllowedOrigins = () => {
  const fromEnv = (process.env.CLIENT_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [
    ...fromEnv,
    'https://onpharno.netlify.app',
    'https://onpharno.com',
    'https://www.onpharno.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
};

export const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const xrw = req.get('X-Requested-With');
  if (!xrw) {
    return res.status(403).json({ success: false, message: 'CSRF protection: missing X-Requested-With header' });
  }

  const origin = req.get('Origin');
  const referer = req.get('Referer');
  const allowed = getAllowedOrigins();
  const source = origin || (referer ? (() => { try { return new URL(referer).origin; } catch { return ''; } })() : '');

  // In non-browser/server-to-server contexts Origin/Referer may be absent; header check still applies.
  if (source && !allowed.includes(source)) {
    return res.status(403).json({ success: false, message: 'CSRF protection: invalid origin' });
  }

  return next();
};

export default csrfProtection;

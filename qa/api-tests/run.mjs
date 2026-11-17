/**
 * Minimal API auth/CSRF checks (no secrets printed).
 * Usage:
 *   API_BASE_URL=http://localhost:5000/api/v1 TEST_EMAIL=... TEST_PASSWORD=... node qa/api-tests/run.mjs
 * If credentials are not provided, credentialed login/refresh/logout flow is marked SKIPPED.
 */
const base = (process.env.API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
const email = process.env.TEST_EMAIL;
const password = process.env.TEST_PASSWORD;

let cookieJar = '';
const results = [];

function storeCookies(res) {
  const raw = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
  const pairs = raw.map((c) => c.split(';')[0]).filter(Boolean);
  if (!pairs.length) return;
  const map = new Map(cookieJar.split(';').map((s) => s.trim()).filter(Boolean).map((p) => [p.split('=')[0], p]));
  for (const p of pairs) map.set(p.split('=')[0], p);
  cookieJar = [...map.values()].join('; ');
}

async function req(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (cookieJar) headers.Cookie = cookieJar;
  const res = await fetch(base + path, { ...opts, headers });
  storeCookies(res);
  let body = null;
  try { body = await res.json(); } catch {}
  return { res, body };
}

function record(name, pass, detail = '') {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} - ${name}${detail ? ` (${detail})` : ''}`);
}

async function tryReq(name, fn) {
  try {
    const { pass, detail } = await fn();
    record(name, pass, detail);
  } catch (e) {
    record(name, false, `error=${e.message || 'request failed'}`);
  }
}

async function main() {
  console.log(`Base: ${base}`);

  await tryReq('Protected route without cookie returns 401', async () => {
    const res = await fetch(base + '/admin/dashboard-stats', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    return { pass: res.status === 401, detail: `status=${res.status}` };
  });

  await tryReq('CSRF blocks POST without X-Requested-With', async () => {
    const res = await fetch(base + '/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    return { pass: res.status === 403, detail: `status=${res.status}` };
  });

  if (!email || !password) {
    console.log('SKIP - credentialed login/refresh/logout flow (set TEST_EMAIL and TEST_PASSWORD)');
  } else {
    // Login sets cookies
    cookieJar = '';
    {
      const { res, body } = await req('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ email, password }),
      });
      const hasCookies = cookieJar.includes('token=') || cookieJar.includes('refreshToken=');
      record('Login succeeds and sets auth cookies', res.status === 200 && body?.success && hasCookies, `status=${res.status}, cookies=${hasCookies}`);
    }

    // Authenticated access
    {
      const { res, body } = await req('/auth/me', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      record('Authenticated /auth/me succeeds with cookie', res.status === 200 && body?.success, `status=${res.status}`);
    }

    // Refresh
    {
      const { res, body } = await req('/auth/refresh', { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/json' } });
      record('Refresh issues new session', res.status === 200 && body?.success, `status=${res.status}`);
    }

    // Logout clears
    {
      const { res } = await req('/auth/logout', { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/json' } });
      const cleared = /token=;|token=([^;]*)?;\s*Max-Age=0|Expires=Thu, 01 Jan 1970/i.test(''); // cookie jar updated; rely on follow-up
      const { res: meRes } = await req('/auth/me', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      record('Logout clears session', res.status === 200 && meRes.status === 401, `logout=${res.status}, meAfter=${meRes.status}`);
    }
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error('Test runner error:', e.message);
  process.exit(1);
});

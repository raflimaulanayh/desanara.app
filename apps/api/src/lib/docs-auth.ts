import type { Context, MiddlewareHandler } from 'hono'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import { timingSafeEqual } from 'hono/utils/buffer'
import { BRAND_MARK_SVG } from './brand-mark'
import { errorBody } from './errors'
import type { createRouter } from './router'

/**
 * Login for the API reference (/docs, /openapi.json) in production.
 *
 * A branded form instead of HTTP Basic Auth: the browser's basic-auth dialog cannot be styled, and
 * Scalar's own requests do not resend basic credentials. After a correct login the browser keeps a
 * signed, HttpOnly, SameSite=Strict cookie for 8 hours. The signing key is derived from the
 * password, so changing DOCS_PASSWORD signs everyone out.
 */
export interface DocsCredentials {
  username: string
  password: string
}

const COOKIE = 'desanara_docs'
const TTL_SECONDS = 8 * 60 * 60

export function registerDocsAuth(
  app: ReturnType<typeof createRouter>,
  credentials: DocsCredentials,
): MiddlewareHandler {
  const key = `docs:${credentials.username}:${credentials.password}`

  const isSignedIn = async (c: Context) => {
    const value = await getSignedCookie(c, key, COOKIE)
    return typeof value === 'string' && Number(value) > Date.now()
  }

  app.get('/docs/login', async (c) => {
    if (await isSignedIn(c)) return c.redirect('/docs')
    return c.html(loginPage({}))
  })

  app.post('/docs/login', async (c) => {
    const body = await c.req.parseBody()
    const username = typeof body.username === 'string' ? body.username.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const ok =
      (await timingSafeEqual(username, credentials.username)) &&
      (await timingSafeEqual(password, credentials.password))
    if (!ok) {
      // Small fixed delay: slows down guessing without hurting a real user.
      await new Promise((resolve) => setTimeout(resolve, 400))
      return c.html(loginPage({ username, error: true }), 401)
    }
    await setSignedCookie(c, COOKIE, String(Date.now() + TTL_SECONDS * 1000), key, {
      path: '/',
      httpOnly: true,
      secure: new URL(c.req.url).protocol === 'https:',
      sameSite: 'Strict',
      maxAge: TTL_SECONDS,
    })
    return c.redirect('/docs', 303)
  })

  app.get('/docs/logout', (c) => {
    deleteCookie(c, COOKIE, { path: '/' })
    return c.redirect('/docs/login', 303)
  })

  return async (c, next) => {
    if (await isSignedIn(c)) return next()
    if (c.req.path === '/docs') return c.redirect('/docs/login', 302)
    return c.json(errorBody(c, 'UNAUTHENTICATED', 'Login required'), 401)
  }
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!,
  )

function loginPage({ username = '', error = false }: { username?: string; error?: boolean }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Sign in · Desanara API Reference</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400..800&display=swap" rel="stylesheet">
<style>
  :root {
    --green: #387b4c; --green-hover: #2e6640; --cream: #f9f4e7; --cream-strong: #f1e8d3;
    --line: #e8dfcb; --line-strong: #d2c4a8; --ink: #1c1917; --muted: #57534e;
    --danger: #b42318; --danger-soft: #fdecea; --sun: #e3a84f;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0; color: var(--ink); background: var(--cream);
    font: 400 16px/1.55 'Montserrat', ui-sans-serif, system-ui, sans-serif;
    display: grid; place-items: center; padding: 24px 16px;
    background-image:
      radial-gradient(120% 70% at 50% 120%, rgba(15, 90, 55, 0.10), transparent 60%),
      radial-gradient(60% 40% at 85% -10%, rgba(227, 168, 79, 0.18), transparent 70%);
  }
  main { width: 100%; max-width: 400px; }
  .card {
    background: #fff; border: 1px solid var(--line); border-radius: 20px;
    padding: 32px 28px 28px; box-shadow: 0 1px 2px rgba(28, 25, 23, 0.04), 0 12px 32px -12px rgba(15, 90, 55, 0.18);
  }
  .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
  .brand svg { flex: none; }
  .eyebrow {
    display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase; color: var(--green);
    background: rgba(15, 90, 55, 0.08); border-radius: 999px; padding: 4px 10px;
  }
  .eyebrow::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--sun); }
  h1 { font-size: 24px; line-height: 1.2; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 6px; }
  .lead { color: var(--muted); margin: 0 0 24px; font-size: 15px; }
  .alert {
    display: flex; gap: 10px; align-items: flex-start; background: var(--danger-soft); color: var(--danger);
    border: 1px solid rgba(180, 35, 24, 0.2); border-radius: 12px; padding: 10px 12px; font-size: 14px;
    font-weight: 600; margin: 0 0 18px;
  }
  .alert svg { flex: none; margin-top: 2px; }
  label { display: block; font-size: 14px; font-weight: 600; margin: 0 0 6px; }
  .field { margin-bottom: 16px; position: relative; }
  input {
    width: 100%; height: 48px; padding: 0 14px; font: inherit; color: var(--ink); background: #fff;
    border: 1.5px solid var(--line-strong); border-radius: 12px; transition: border-color .15s, box-shadow .15s;
  }
  input:hover { border-color: #b9a988; }
  input:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 4px rgba(15, 90, 55, 0.14); }
  .error input { border-color: var(--danger); }
  .password input { padding-right: 76px; }
  .toggle {
    position: absolute; right: 6px; bottom: 6px; height: 36px; padding: 0 12px; border: 0; border-radius: 9px;
    background: transparent; color: var(--green); font: 600 13px/1 inherit; font-family: inherit; cursor: pointer;
  }
  .toggle:hover { background: rgba(15, 90, 55, 0.08); }
  .toggle:focus-visible { outline: 2px solid var(--green); outline-offset: 2px; }
  button[type=submit] {
    width: 100%; height: 50px; margin-top: 8px; border: 0; border-radius: 999px; cursor: pointer;
    background: var(--green); color: #fff; font: 700 16px/1 inherit; font-family: inherit;
    transition: background .15s, transform .05s;
  }
  button[type=submit]:hover { background: var(--green-hover); }
  button[type=submit]:active { transform: translateY(1px); }
  button[type=submit]:focus-visible { outline: 3px solid var(--sun); outline-offset: 3px; }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>
</head>
<body>
<main>
  <div class="card">
    <div class="brand">${BRAND_MARK_SVG}<span class="eyebrow">API Reference</span></div>
    <h1>Sign in to the API reference</h1>
    <p class="lead">For the Desanara development team only.</p>
    ${
      error
        ? `<p class="alert" role="alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16.5v.01"/></svg>Incorrect username or password. Please try again.</p>`
        : ''
    }
    <form method="post" action="/docs/login" class="${error ? 'error' : ''}" novalidate>
      <div class="field">
        <label for="username">Username</label>
        <input id="username" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required value="${escapeHtml(username)}" ${username ? '' : 'autofocus'}>
      </div>
      <div class="field password">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required ${username ? 'autofocus' : ''}>
        <button type="button" class="toggle" aria-controls="password" aria-pressed="false">Show</button>
      </div>
      <button type="submit">Sign in</button>
    </form>
  </div>
</main>
<script>
  const t = document.querySelector('.toggle'), p = document.getElementById('password');
  t.addEventListener('click', () => {
    const show = p.type === 'password';
    p.type = show ? 'text' : 'password';
    t.textContent = show ? 'Hide' : 'Show';
    t.setAttribute('aria-pressed', String(show));
    p.focus();
  });
</script>
</body>
</html>`
}

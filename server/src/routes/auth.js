import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import {
  clearSessionCookie,
  readSession,
  requireAuth,
  setSessionCookie,
  signToken,
} from '../auth.js'
import { ROLES, logEvent } from '../audit.js'
import { rateLimit } from '../rate-limit.js'

const router = Router()

const LOGIN_WINDOW = 10 * 60 * 1000

// Durable counters (Postgres, shared by every API process): 8 attempts per
// IP + email and 20 attempts per IP in ten minutes. Ordinary users never reach
// either limit; a password-guessing script does almost immediately.
const perAccount = rateLimit({
  name: 'login-account',
  limit: 8,
  windowMs: LOGIN_WINDOW,
  key: (req) => `${req.ip}:${String(req.body?.email || '').trim().toLowerCase()}`,
  message: 'تعداد تلاش‌های ورود زیاد بوده است. لطفاً چند دقیقه بعد دوباره امتحان کنید.',
})
const perIp = rateLimit({
  name: 'login-ip',
  limit: 20,
  windowMs: LOGIN_WINDOW,
  message: 'تعداد تلاش‌های ورود از این دستگاه زیاد بوده است. لطفاً چند دقیقه بعد دوباره امتحان کنید.',
})

router.post('/login', perIp, perAccount, async (req, res, next) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'ایمیل و رمز عبور را وارد کنید.' })
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    const valid = user ? await bcrypt.compare(password, user.password_hash) : false
    if (!user || !valid || !user.is_active || !ROLES.includes(user.role)) {
      await logEvent({
        req,
        action: 'login_failed',
        entity: 'auth',
        detail: `email=${email}`,
      })
      // One generic message: never reveal whether the account exists.
      return res.status(401).json({ error: 'ایمیل یا رمز عبور نادرست است.' })
    }

    await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id])
    setSessionCookie(res, signToken(user))
    await logEvent({
      req,
      user: { id: user.id, email: user.email },
      action: 'login',
      entity: 'auth',
      entityId: user.id,
    })
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (error) {
    next(error)
  }
})

router.post('/logout', (req, res) => {
  const session = readSession(req)
  clearSessionCookie(res)
  if (session?.sub) {
    logEvent({ req, user: { id: session.sub, email: session.email }, action: 'logout', entity: 'auth' })
  }
  res.json({ ok: true })
})

router.get('/me', async (req, res, next) => {
  const session = readSession(req)
  if (!session?.sub) return res.json({ user: null })
  try {
    const result = await query(
      'SELECT id, email, name, role, is_active, session_version FROM users WHERE id = $1',
      [session.sub]
    )
    const user = result.rows[0]
    // A session issued before the last password change is no longer valid.
    if (
      !user ||
      !user.is_active ||
      Number(session.sv || 0) !== Number(user.session_version || 0)
    ) {
      clearSessionCookie(res)
      return res.json({ user: null })
    }
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (error) {
    next(error)
  }
})

const passwordLimiter = rateLimit({
  name: 'password-change',
  limit: 6,
  windowMs: 10 * 60 * 1000,
  key: (req) => `${req.ip}:${req.user?.id || 'anonymous'}`,
})

router.post('/password', requireAuth, passwordLimiter, async (req, res, next) => {
  try {
    const currentPassword = String(req.body?.current_password || '')
    const newPassword = String(req.body?.new_password || '')
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد.' })
    }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ error: 'رمز عبور باید شامل حرف و عدد باشد.' })
    }
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id])
    const valid = await bcrypt.compare(currentPassword, result.rows[0]?.password_hash || '')
    if (!valid) {
      return res.status(400).json({ error: 'رمز عبور فعلی نادرست است.' })
    }
    const hash = await bcrypt.hash(newPassword, 10)
    // Bumping session_version signs out every other session that used the old
    // password; this browser gets a fresh cookie so the change is not disruptive.
    const updated = await query(
      `UPDATE users SET password_hash = $1, session_version = session_version + 1
       WHERE id = $2 RETURNING session_version`,
      [hash, req.user.id]
    )
    setSessionCookie(
      res,
      signToken({ ...req.user, session_version: updated.rows[0].session_version })
    )
    await logEvent({ req, action: 'password_changed', entity: 'users', entityId: req.user.id })
    res.json({ message: 'رمز عبور با موفقیت تغییر کرد. سایر نشست‌های فعال بسته شدند.' })
  } catch (error) {
    next(error)
  }
})

export default router

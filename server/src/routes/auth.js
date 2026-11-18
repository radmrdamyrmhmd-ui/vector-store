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

const router = Router()

// In-memory throttle: 8 failed attempts per 10 minutes per IP + email pair.
const attempts = new Map()
const WINDOW = 10 * 60 * 1000
const LIMIT = 8

function tooManyAttempts(key) {
  const entry = attempts.get(key)
  if (!entry) return false
  if (Date.now() - entry.first > WINDOW) {
    attempts.delete(key)
    return false
  }
  return entry.count >= LIMIT
}

function noteFailure(key) {
  const entry = attempts.get(key)
  if (!entry || Date.now() - entry.first > WINDOW) {
    attempts.set(key, { count: 1, first: Date.now() })
  } else {
    entry.count += 1
  }
}

router.post('/login', async (req, res, next) => {
  const ip = req.ip || 'unknown'
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const key = `${ip}:${email}`
  try {
    if (tooManyAttempts(key)) {
      return res.status(429).json({
        error: 'تعداد تلاش‌های ناموفق زیاد بوده است. لطفاً چند دقیقه بعد دوباره امتحان کنید.',
      })
    }
    if (!email || !password) {
      return res.status(400).json({ error: 'ایمیل و رمز عبور را وارد کنید.' })
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    const valid = user ? await bcrypt.compare(password, user.password_hash) : false
    if (!user || !valid || !user.is_active || !ROLES.includes(user.role)) {
      noteFailure(key)
      await logEvent({
        req,
        action: 'login_failed',
        entity: 'auth',
        detail: `email=${email}`,
      })
      // One generic message: never reveal whether the account exists.
      return res.status(401).json({ error: 'ایمیل یا رمز عبور نادرست است.' })
    }

    attempts.delete(key)
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
      'SELECT id, email, name, role FROM users WHERE id = $1 AND is_active = true',
      [session.sub]
    )
    res.json({ user: result.rows[0] || null })
  } catch (error) {
    next(error)
  }
})

router.post('/password', requireAuth, async (req, res, next) => {
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
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id])
    await logEvent({ req, action: 'password_changed', entity: 'users', entityId: req.user.id })
    res.json({ message: 'رمز عبور با موفقیت تغییر کرد.' })
  } catch (error) {
    next(error)
  }
})

export default router

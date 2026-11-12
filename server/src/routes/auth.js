import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import {
  clearSessionCookie,
  readSession,
  requireAdmin,
  setSessionCookie,
  signToken,
} from '../auth.js'

const router = Router()

// Very small in-memory throttle: 8 failed attempts per 10 minutes per IP.
const attempts = new Map()
const WINDOW = 10 * 60 * 1000
const LIMIT = 8

function tooManyAttempts(ip) {
  const entry = attempts.get(ip)
  if (!entry) return false
  if (Date.now() - entry.first > WINDOW) {
    attempts.delete(ip)
    return false
  }
  return entry.count >= LIMIT
}

function noteFailure(ip) {
  const entry = attempts.get(ip)
  if (!entry || Date.now() - entry.first > WINDOW) {
    attempts.set(ip, { count: 1, first: Date.now() })
  } else {
    entry.count += 1
  }
}

router.post('/login', async (req, res, next) => {
  const ip = req.ip || 'unknown'
  try {
    if (tooManyAttempts(ip)) {
      return res.status(429).json({
        error: 'تعداد تلاش‌های ناموفق زیاد بوده است. لطفاً چند دقیقه بعد دوباره امتحان کنید.',
      })
    }
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')
    if (!email || !password) {
      return res.status(400).json({ error: 'ایمیل و رمز عبور را وارد کنید.' })
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    const valid = user ? await bcrypt.compare(password, user.password_hash) : false
    if (!user || !valid || user.role !== 'admin') {
      noteFailure(ip)
      return res.status(401).json({ error: 'ایمیل یا رمز عبور نادرست است.' })
    }

    attempts.delete(ip)
    setSessionCookie(res, signToken(user))
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (error) {
    next(error)
  }
})

router.post('/logout', (_req, res) => {
  clearSessionCookie(res)
  res.json({ ok: true })
})

router.get('/me', async (req, res, next) => {
  const session = readSession(req)
  if (!session?.sub) return res.json({ user: null })
  try {
    const result = await query(
      'SELECT id, email, name, role FROM users WHERE id = $1 AND role = $2',
      [session.sub, 'admin']
    )
    res.json({ user: result.rows[0] || null })
  } catch (error) {
    next(error)
  }
})

router.post('/password', requireAdmin, async (req, res, next) => {
  try {
    const currentPassword = String(req.body?.current_password || '')
    const newPassword = String(req.body?.new_password || '')
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد.' })
    }
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id])
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash)
    if (!valid) {
      return res.status(400).json({ error: 'رمز عبور فعلی نادرست است.' })
    }
    const hash = await bcrypt.hash(newPassword, 10)
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id])
    res.json({ message: 'رمز عبور با موفقیت تغییر کرد.' })
  } catch (error) {
    next(error)
  }
})

export default router

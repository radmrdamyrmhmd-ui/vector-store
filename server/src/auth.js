import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { query } from './db.js'

const fallbackSecret = crypto.randomBytes(32).toString('hex')
const SECRET = process.env.JWT_SECRET || fallbackSecret
if (!process.env.JWT_SECRET) {
  console.warn(
    '[auth] JWT_SECRET is not set — using an ephemeral key. Sessions reset on restart.'
  )
}

export const COOKIE_NAME = 'ho_session'
const MAX_AGE = 7 * 24 * 60 * 60 * 1000

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      // Session generation: a password change bumps users.session_version, which
      // invalidates every token issued before it.
      sv: Number(user.session_version || 0),
    },
    SECRET,
    { expiresIn: '7d' }
  )
}

export function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    // Behind the preview proxy the request itself is plain HTTP; a secure cookie
    // there would be dropped, so it is only flagged on an HTTPS deployment.
    secure: /^https:/i.test(process.env.PUBLIC_BASE_URL || ''),
    maxAge: MAX_AGE,
    path: '/',
  })
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' })
}

export function readSession(req) {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) return null
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

// Any signed-in, active user. Access levels are enforced on the server, never
// only by hiding buttons in the panel.
export async function requireAuth(req, res, next) {
  const session = readSession(req)
  if (!session?.sub) {
    return res.status(401).json({ error: 'برای دسترسی به این بخش باید وارد شوید.' })
  }
  try {
    const result = await query(
      'SELECT id, email, name, role, is_active, session_version FROM users WHERE id = $1',
      [session.sub]
    )
    const user = result.rows[0]
    if (
      !user ||
      !user.is_active ||
      Number(session.sv || 0) !== Number(user.session_version || 0)
    ) {
      clearSessionCookie(res)
      return res.status(401).json({ error: 'نشست شما معتبر نیست. دوباره وارد شوید.' })
    }
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'برای دسترسی به این بخش باید وارد شوید.' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'سطح دسترسی شما برای این عملیات کافی نیست.',
      })
    }
    next()
  }
}

// Backwards-compatible alias: every panel route needs at least a signed-in user.
export const requireAdmin = requireAuth

export const canWrite = requireRole('admin', 'editor')
export const adminOnly = requireRole('admin')

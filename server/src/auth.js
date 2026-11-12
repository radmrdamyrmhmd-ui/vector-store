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
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, SECRET, {
    expiresIn: '7d',
  })
}

export function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
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

export async function requireAdmin(req, res, next) {
  const session = readSession(req)
  if (!session?.sub) {
    return res.status(401).json({ error: 'برای دسترسی به این بخش باید وارد شوید.' })
  }
  try {
    const result = await query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [session.sub]
    )
    const user = result.rows[0]
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'دسترسی به این بخش فقط برای مدیران مجاز است.' })
    }
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

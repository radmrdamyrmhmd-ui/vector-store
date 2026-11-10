import jwt from 'jsonwebtoken';
import { query } from './db.js';

const COOKIE_NAME = 'yas_token';
const SECRET = process.env.JWT_SECRET || 'yas_local_dev_jwt_secret';

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, SECRET, { expiresIn: '30d' });
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

export function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role, createdAt: row.created_at };
}

/** Attaches req.user when a valid session cookie is present, never fails. */
export async function attachUser(req, _res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return next();
  try {
    const payload = jwt.verify(token, SECRET);
    const { rows } = await query('select * from users where id = $1', [payload.sub]);
    if (rows[0]) req.user = rows[0];
  } catch {
    /* expired or tampered token: treat as guest */
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'برای انجام این کار باید وارد حساب خود شوید.' });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'دسترسی به این بخش فقط برای مدیر فروشگاه مجاز است.' });
  }
  next();
}

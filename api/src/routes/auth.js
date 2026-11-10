import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { publicUser, setAuthCookie, clearAuthCookie, signToken, requireAuth } from '../auth.js';

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (name.length < 3) return res.status(400).json({ error: 'نام و نام خانوادگی را کامل وارد کنید.' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'ایمیل وارد‌شده معتبر نیست.' });
    if (password.length < 6) return res.status(400).json({ error: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' });

    const exists = await query('select id from users where email = $1', [email]);
    if (exists.rows[0]) return res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده است.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      'insert into users (name, email, password_hash) values ($1,$2,$3) returning *',
      [name, email, passwordHash],
    );
    setAuthCookie(res, signToken(rows[0]));
    res.status(201).json({ user: publicUser(rows[0]) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const { rows } = await query('select * from users where email = $1', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'ایمیل یا رمز عبور نادرست است.' });
    }
    setAuthCookie(res, signToken(user));
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (name.length < 3) return res.status(400).json({ error: 'نام و نام خانوادگی را کامل وارد کنید.' });
    const { rows } = await query('update users set name = $1 where id = $2 returning *', [name, req.user.id]);
    res.json({ user: publicUser(rows[0]) });
  } catch (error) {
    next(error);
  }
});

export default router;

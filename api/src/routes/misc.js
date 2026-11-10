import express from 'express';
import { query } from '../db.js';

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

router.post('/newsletter', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'ایمیل خود را وارد کنید.' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'ایمیل وارد‌شده معتبر نیست.' });

    const { rowCount } = await query(
      'insert into newsletter (email) values ($1) on conflict (email) do nothing',
      [email],
    );
    res.status(201).json({
      message: rowCount
        ? 'عضویت شما در خبرنامه یاس اسپورت ثبت شد.'
        : 'این ایمیل قبلاً در خبرنامه ثبت شده است.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/contact', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const body = String(req.body.body || '').trim();
    if (name.length < 3) return res.status(400).json({ error: 'نام خود را وارد کنید.' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'ایمیل وارد‌شده معتبر نیست.' });
    if (body.length < 10) return res.status(400).json({ error: 'متن پیام باید حداقل ۱۰ کاراکتر باشد.' });

    await query('insert into messages (name, email, phone, subject, body) values ($1,$2,$3,$4,$5)', [
      name,
      email,
      String(req.body.phone || '').trim(),
      String(req.body.subject || '').trim(),
      body,
    ]);
    res.status(201).json({ message: 'پیام شما ثبت شد. تیم پشتیبانی یاس اسپورت به‌زودی پاسخ می‌دهد.' });
  } catch (error) {
    next(error);
  }
});

export default router;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { toEnglishDigits } from '../lib/format';
import { InstagramIcon, TelegramIcon, WhatsappIcon, YoutubeIcon } from '../components/icons';

const SOCIALS = [
  { label: 'اینستاگرام', icon: InstagramIcon },
  { label: 'تلگرام', icon: TelegramIcon },
  { label: 'یوتیوب', icon: YoutubeIcon },
  { label: 'واتساپ', icon: WhatsappIcon },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', body: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'تماس با ما | YAS SPORTS';
  }, []);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (form.name.trim().length < 3) {
      setStatus({ type: 'error', message: 'نام خود را وارد کنید.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      setStatus({ type: 'error', message: 'ایمیل وارد‌شده معتبر نیست.' });
      return;
    }
    if (form.body.trim().length < 10) {
      setStatus({ type: 'error', message: 'متن پیام باید حداقل ۱۰ کاراکتر باشد.' });
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.post('/contact', {
        ...form,
        phone: toEnglishDigits(form.phone),
      });
      setStatus({ type: 'success', message: data.message });
      setForm({ name: '', email: '', phone: '', subject: '', body: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">خانه</Link>
          <span>/</span>
          <span style={{ opacity: 1, color: 'var(--ink)' }}>تماس با ما</span>
        </div>

        <div className="page-head">
          <h1>تماس با ما</h1>
          <p>
            سؤال، پیشنهاد یا پیگیری سفارش؟ پیام خودت را ثبت کن؛ تیم پشتیبانی یاس اسپورت در
            ساعات کاری پاسخ می‌دهد.
          </p>
        </div>

        <div className="contact-grid">
          <form className="panel" onSubmit={submit} noValidate>
            <h2>ارسال پیام</h2>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="name">نام و نام خانوادگی *</label>
                <input id="name" value={form.name} onChange={(event) => setField('name', event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="email">ایمیل *</label>
                <input
                  id="email"
                  type="email"
                  dir="ltr"
                  value={form.email}
                  onChange={(event) => setField('email', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="phone">شماره تماس</label>
                <input
                  id="phone"
                  dir="ltr"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(event) => setField('phone', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="subject">موضوع</label>
                <input id="subject" value={form.subject} onChange={(event) => setField('subject', event.target.value)} />
              </div>
              <div className="field span-2">
                <label htmlFor="body">متن پیام *</label>
                <textarea id="body" value={form.body} onChange={(event) => setField('body', event.target.value)} />
              </div>
            </div>

            {status.message && (
              <p className={status.type === 'success' ? 'form-success' : 'form-alert'} style={{ marginTop: 18 }} role="status">
                {status.message}
              </p>
            )}

            <button type="submit" className="btn btn-dark" style={{ marginTop: 20 }} disabled={submitting}>
              {submitting ? 'در حال ارسال…' : 'ارسال پیام'}
            </button>
          </form>

          <div className="contact-info">
            <div className="info-card">
              <h3>شماره تماس</h3>
              <a href="tel:+982191000000" dir="ltr">
                ۰۲۱-۹۱۰۰۰۰۰۰
              </a>
            </div>
            <div className="info-card">
              <h3>ایمیل فروشگاه</h3>
              <a href="mailto:support@yas-sports.ir" dir="ltr">
                support@yas-sports.ir
              </a>
            </div>
            <div className="info-card">
              <h3>ساعات پاسخ‌گویی</h3>
              <p style={{ direction: 'rtl' }}>شنبه تا پنجشنبه، ۹ تا ۱۸</p>
            </div>
            <div className="info-card">
              <h3>شبکه‌های اجتماعی</h3>
              <div className="socials" style={{ marginTop: 8 }}>
                {SOCIALS.map(({ label, icon: Icon }) => (
                  <span key={label} aria-label={label} role="img" title={`${label} — به‌زودی`}>
                    <Icon />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

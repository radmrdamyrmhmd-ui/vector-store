import { useState } from 'react';
import { api } from '../../lib/api';
import Reveal from '../Reveal';
import { InstagramIcon, TelegramIcon, WhatsappIcon, YoutubeIcon } from '../icons';
import { toEnglishDigits } from '../../lib/format';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SOCIALS = [
  { label: 'اینستاگرام', icon: InstagramIcon },
  { label: 'تلگرام', icon: TelegramIcon },
  { label: 'یوتیوب', icon: YoutubeIcon },
  { label: 'واتساپ', icon: WhatsappIcon },
];

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const value = toEnglishDigits(email).trim();

    if (!value) {
      setStatus({ type: 'error', message: 'برای عضویت، ایمیل خود را وارد کنید.' });
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setStatus({ type: 'error', message: 'ایمیل وارد‌شده معتبر نیست. نمونه: name@example.com' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const data = await api.post('/newsletter', { email: value });
      setStatus({ type: 'success', message: data.message });
      setEmail('');
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="container newsletter__inner">
        <Reveal>
          <p className="eyebrow">Newsletter</p>
          <h2 className="newsletter__title" style={{ marginTop: 16 }}>
            اولین نفر باش.
            <br />
            همیشه در حرکت.
          </h2>
          <p className="section-sub">
            در خبرنامه یاس اسپورت عضو شو و از جدیدترین محصولات، کالکشن‌ها و پیشنهادهای ویژه باخبر
            باش.
          </p>
        </Reveal>

        <Reveal delay={90}>
          <form className="newsletter__form" onSubmit={submit} noValidate>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ایمیل خود را وارد کنید"
              aria-label="ایمیل برای عضویت در خبرنامه"
              dir="ltr"
            />
            <button type="submit" className="btn btn-dark" disabled={submitting}>
              {submitting ? 'در حال ثبت…' : 'عضویت در خبرنامه'}
              <span aria-hidden="true">↗</span>
            </button>
          </form>

          {status.message && (
            <p
              className={status.type === 'success' ? 'form-success' : 'form-alert'}
              style={{ marginTop: 12 }}
              role="status"
            >
              {status.message}
            </p>
          )}

          <div style={{ marginTop: 32 }}>
            <p className="eyebrow" style={{ marginBottom: 14 }}>
              ما را در شبکه‌های اجتماعی دنبال کن
            </p>
            <div className="socials">
              {SOCIALS.map(({ label, icon: Icon }) => (
                <span key={label} aria-label={label} role="img" title={`${label} — به‌زودی`}>
                  <Icon />
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

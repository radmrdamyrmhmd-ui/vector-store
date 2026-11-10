import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toEnglishDigits } from '../lib/format';

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="page">
      <div className="container auth-wrap">
        <div className="auth-card">
          <h1>{title}</h1>
          <p>{subtitle}</p>
          {children}
          <div className="auth-foot">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'ورود به حساب | YAS SPORTS';
  }, []);

  useEffect(() => {
    if (user) navigate(location.state?.from || '/', { replace: true });
  }, [user, navigate, location.state]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('ایمیل و رمز عبور را وارد کنید.');
      return;
    }
    setSubmitting(true);
    try {
      const logged = await login(toEnglishDigits(form.email).trim(), form.password);
      navigate(logged.role === 'admin' ? '/admin' : location.state?.from || '/', { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="ورود به حساب"
      subtitle="برای پیگیری سفارش‌ها و خرید سریع‌تر وارد حساب خود شوید."
      footer={
        <>
          حساب کاربری ندارید؟ <Link to="/register">ساخت حساب جدید</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="email">ایمیل</label>
          <input
            id="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="password">رمز عبور</label>
          <input
            id="password"
            type="password"
            dir="ltr"
            autoComplete="current-password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
        </div>
        {error && <p className="form-alert">{error}</p>}
        <button type="submit" className="btn btn-dark btn-block" disabled={submitting}>
          {submitting ? 'در حال ورود…' : 'ورود'}
        </button>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'ساخت حساب | YAS SPORTS';
  }, []);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.name.trim().length < 3) {
      setError('نام و نام خانوادگی را کامل وارد کنید.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      setError('ایمیل وارد‌شده معتبر نیست.');
      return;
    }
    if (form.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    setSubmitting(true);
    try {
      await register(form.name.trim(), toEnglishDigits(form.email).trim(), form.password);
      navigate('/', { replace: true });
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="ساخت حساب جدید"
      subtitle="با ساخت حساب، سفارش‌ها و اطلاعات خود را در یک‌جا مدیریت کنید."
      footer={
        <>
          قبلاً حساب دارید؟ <Link to="/login">ورود به حساب</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="name">نام و نام خانوادگی</label>
          <input id="name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="email">ایمیل</label>
          <input
            id="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="password">رمز عبور</label>
          <input
            id="password"
            type="password"
            dir="ltr"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
        </div>
        {error && <p className="form-alert">{error}</p>}
        <button type="submit" className="btn btn-dark btn-block" disabled={submitting}>
          {submitting ? 'در حال ساخت حساب…' : 'ساخت حساب'}
        </button>
      </form>
    </AuthShell>
  );
}

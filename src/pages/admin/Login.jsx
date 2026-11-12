import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'
import { useAuth } from '../../lib/auth.jsx'
import { Button, Field, Input, Notice } from '../../components/ui.jsx'
import { Logo } from '../../components/Art.jsx'

export default function AdminLogin() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user) {
    const target = location.state?.from || '/admin'
    return <Navigate to={target} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('ایمیل و رمز عبور را وارد کنید.')
      return
    }
    setBusy(true)
    try {
      await login(email.trim(), password)
      navigate(location.state?.from || '/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream/50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-[26px] border border-line bg-white p-7 shadow-soft sm:p-9">
          <div className="flex items-center justify-between">
            <Logo name="همراهان امید" subtitle="پنل مدیریت" />
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          <h1 className="mt-6 text-[20px] text-ink">ورود مدیران</h1>
          <p className="mt-2 text-[12px] leading-6 text-muted">
            این بخش فقط برای کاربران دارای نقش مدیر در دسترس است.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <Field label="ایمیل" htmlFor="admin-email" required>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                dir="ltr"
                placeholder="admin@example.com"
              />
            </Field>
            <Field label="رمز عبور" htmlFor="admin-password" required>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                dir="ltr"
              />
            </Field>

            {error && <Notice tone="error">{error}</Notice>}

            <Button type="submit" className="w-full" loading={busy}>
              ورود به پنل مدیریت
            </Button>
          </form>

          <p className="mt-5 text-center text-[11px] leading-6 text-muted">
            دسترسی این بخش محدود است. اگر رمز عبور خود را فراموش کرده‌اید، از طریق متغیرهای محیطی
            سرور یا تماس با پشتیبانی مجموعه اقدام کنید.
          </p>
        </div>

        <div className="mt-5 text-center">
          <Button to="/" variant="ghost" size="sm">
            بازگشت به وب‌سایت
          </Button>
        </div>
      </div>
    </div>
  )
}

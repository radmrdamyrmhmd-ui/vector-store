import { useState } from 'react'
import { KeyRound, Plus, ShieldCheck, Trash2, UserCog, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useResource } from '../../lib/useResource.js'
import { useAuth } from '../../lib/auth.jsx'
import { Button, Field, Input, Notice, Select, Spinner } from '../../components/ui.jsx'
import { AdminHeader, AdminNotice, EmptyRow, Panel, Table } from './parts.jsx'
import { ROLE_LABELS } from '../../lib/nav.js'
import { formatDateTime, num } from '../../lib/format.js'

const ROLE_HELP = {
  admin: 'دسترسی کامل: محتوا، کاربران، تنظیمات و پشتیبان‌گیری.',
  editor: 'محتوای سایت، رسانه و مدیریت درخواست‌ها؛ بدون دسترسی به کاربران و تنظیمات.',
  viewer: 'فقط مشاهده فهرست‌ها؛ هیچ تغییری نمی‌تواند ثبت کند.',
}

const EMPTY = { email: '', name: '', role: 'editor', password: '' }

export default function AdminUsers() {
  const { user: me } = useAuth()
  const { data, loading, error, reload } = useResource(() => api('/admin/users'), [])
  const [form, setForm] = useState(null)
  const [resetFor, setResetFor] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const users = data || []

  async function create(event) {
    event.preventDefault()
    setBusy(true)
    try {
      await api('/admin/users', { method: 'POST', body: form })
      setNotice({ tone: 'success', message: 'کاربر ایجاد شد.' })
      setForm(null)
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    } finally {
      setBusy(false)
    }
  }

  async function update(user, patch) {
    try {
      await api(`/admin/users/${user.id}`, {
        method: 'PUT',
        body: { name: user.name, role: user.role, is_active: user.is_active, ...patch },
      })
      setNotice({ tone: 'success', message: 'دسترسی کاربر به‌روز شد.' })
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    }
  }

  async function submitReset(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const data = await api(`/admin/users/${resetFor.id}/password`, {
        method: 'POST',
        body: { password: resetPassword },
      })
      setNotice({ tone: 'success', message: data.message })
      setResetFor(null)
      setResetPassword('')
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    } finally {
      setBusy(false)
    }
  }

  async function remove(user) {
    if (!window.confirm(`حساب «${user.email}» حذف شود؟ این کار قابل بازگشت نیست.`)) return
    try {
      await api(`/admin/users/${user.id}`, { method: 'DELETE' })
      setNotice({ tone: 'success', message: 'کاربر حذف شد.' })
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    }
  }

  return (
    <>
      <AdminHeader
        title="کاربران و سطح دسترسی"
        description="سطح دسترسی روی سرور اعمال می‌شود؛ پنهان‌کردن دکمه‌ها در پنل تنها لایه ظاهری است."
        action={
          <Button size="sm" onClick={() => setForm({ ...EMPTY })}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            کاربر جدید
          </Button>
        }
      />

      <AdminNotice notice={notice} onClose={() => setNotice(null)} />
      {error && <AdminNotice notice={{ tone: 'error', message: error }} onClose={() => {}} />}

      {form && (
        <Panel
          className="mb-5"
          title="کاربر جدید"
          action={
            <button type="button" onClick={() => setForm(null)} aria-label="بستن فرم" className="text-muted hover:text-ink">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          }
        >
          <form onSubmit={create} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ایمیل" required>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} dir="ltr" autoComplete="off" />
              </Field>
              <Field label="نام نمایشی">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="سطح دسترسی">
                <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="رمز عبور" required hint="حداقل ۸ کاراکتر، شامل حرف و عدد">
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  dir="ltr"
                  autoComplete="new-password"
                />
              </Field>
            </div>
            <p className="text-[11px] leading-6 text-muted">{ROLE_HELP[form.role]}</p>
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={busy}>
                ایجاد کاربر
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm(null)}>
                انصراف
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {resetFor && (
        <Panel
          className="mb-5"
          title={`بازنشانی رمز عبور ${resetFor.email}`}
          action={
            <button
              type="button"
              onClick={() => {
                setResetFor(null)
                setResetPassword('')
              }}
              aria-label="بستن فرم"
              className="text-muted hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          }
        >
          <form onSubmit={submitReset} className="space-y-3">
            <Field label="رمز عبور جدید" required hint="حداقل ۸ کاراکتر، شامل حرف و عدد">
              <Input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                dir="ltr"
                autoComplete="new-password"
              />
            </Field>
            <Note>رمز قدیمی بلافاصله بی‌اعتبار می‌شود و کاربر باید با رمز جدید وارد شود.</Note>
            <Button type="submit" size="sm" loading={busy}>
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              بازنشانی رمز
            </Button>
          </form>
        </Panel>
      )}

      <Panel title={`کاربران (${num(users.length)})`}>
        {loading ? (
          <Spinner />
        ) : (
          <Table head={['کاربر', 'سطح دسترسی', 'وضعیت', 'آخرین ورود', 'عملیات']}>
            {users.length === 0 && <EmptyRow colSpan={5}>کاربری ثبت نشده است.</EmptyRow>}
            {users.map((user) => {
              const isMe = user.id === me?.id
              return (
                <tr key={user.id} className="border-b border-line/70 last:border-0">
                  <td className="px-3 py-3">
                    <p className="font-medium text-ink">
                      {user.name}
                      {isMe && <span className="mr-1.5 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] text-brand">شما</span>}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted" dir="ltr">
                      {user.email}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <Select
                      value={user.role}
                      onChange={(e) => update(user, { role: e.target.value })}
                      className="!py-1.5 !text-[11.5px]"
                      aria-label={`سطح دسترسی ${user.email}`}
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => update(user, { is_active: !user.is_active })}
                      className={`rounded-full px-2.5 py-1 text-[10.5px] transition ${
                        user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-cream text-muted'
                      }`}
                    >
                      {user.is_active ? 'فعال' : 'غیرفعال'}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-[11px] text-muted">
                    {user.last_login_at ? formatDateTime(user.last_login_at) : 'بدون ورود'}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setResetFor(user)
                          setResetPassword('')
                        }}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-brand"
                        aria-label={`بازنشانی رمز ${user.email}`}
                      >
                        <UserCog className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(user)}
                        disabled={isMe}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-red-600 disabled:opacity-40"
                        aria-label={`حذف ${user.email}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </Table>
        )}
      </Panel>

      <div className="mt-5 flex items-start gap-2.5 rounded-[22px] border border-line bg-white px-5 py-4 text-[11.5px] leading-7 text-muted">
        <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
        <p>
          حداقل یک مدیر فعال همیشه باقی می‌ماند تا دسترسی به پنل قطع نشود. هر ورود، تغییر محتوا و
          تغییر کاربر در «گزارش فعالیت مدیران» ثبت می‌شود.
        </p>
      </div>
    </>
  )
}

function Note({ children }) {
  return <Notice tone="info">{children}</Notice>
}

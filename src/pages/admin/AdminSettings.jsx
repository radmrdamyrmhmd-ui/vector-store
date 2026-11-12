import { useEffect, useState } from 'react'
import { api } from '../../lib/api.js'
import { useSite } from '../../lib/site.jsx'
import { Button, Field, Input, Notice, Spinner, Textarea } from '../../components/ui.jsx'
import { AdminHeader, Panel, UploadField } from './parts.jsx'

const TEXT_FIELDS = [
  { key: 'site_name', label: 'نام مجموعه' },
  { key: 'site_subtitle', label: 'زیرعنوان لوگو' },
  { key: 'hero_title', label: 'تیتر بخش Hero', full: true },
  { key: 'hero_text', label: 'متن بخش Hero', area: true, full: true },
  { key: 'hero_note', label: 'پیام کوتاه Hero', full: true },
  { key: 'about_title', label: 'عنوان معرفی مجموعه', full: true },
  { key: 'about_text', label: 'متن معرفی مجموعه', area: true, full: true },
  { key: 'mission_title', label: 'عنوان مأموریت', full: true },
  { key: 'mission_text', label: 'متن مأموریت', area: true, full: true },
  { key: 'phone', label: 'تلفن تماس' },
  { key: 'email', label: 'ایمیل' },
  { key: 'address', label: 'نشانی', full: true },
  { key: 'instagram', label: 'اینستاگرام (نشانی کامل)' },
  { key: 'telegram', label: 'تلگرام (نشانی کامل)' },
  { key: 'whatsapp', label: 'واتساپ (نشانی کامل)' },
  { key: 'footer_about', label: 'معرفی در فوتر', area: true, full: true },
  { key: 'legal_owner', label: 'نام حقوقی در فوتر' },
]

export default function AdminSettings() {
  const site = useSite()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const [password, setPassword] = useState({ current_password: '', new_password: '' })
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordNotice, setPasswordNotice] = useState(null)

  useEffect(() => {
    if (site.settings && !form) {
      setForm({
        ...site.settings,
        last_updated: (site.settings.last_updated || '').slice(0, 10),
        people_supported: site.settings.people_supported ?? '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site.settings])

  if (!form) return <Spinner />

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    try {
      await api('/admin/settings', { method: 'PUT', body: form })
      await site.refresh()
      setNotice({ tone: 'success', message: 'تنظیمات سایت ذخیره شد.' })
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function changePassword(event) {
    event.preventDefault()
    setPasswordBusy(true)
    setPasswordNotice(null)
    try {
      const data = await api('/auth/password', { method: 'POST', body: password })
      setPasswordNotice({ tone: 'success', message: data.message })
      setPassword({ current_password: '', new_password: '' })
    } catch (err) {
      setPasswordNotice({ tone: 'error', message: err.message })
    } finally {
      setPasswordBusy(false)
    }
  }

  return (
    <>
      <AdminHeader
        title="تنظیمات سایت"
        description="نام مجموعه، متن‌های صفحه اصلی، اطلاعات تماس و شبکه‌های اجتماعی از این بخش قابل تغییر است."
      />

      {notice && <Notice tone={notice.tone} className="mb-5">{notice.message}</Notice>}

      <form onSubmit={save} className="space-y-4">
        <Panel title="متن‌ها و اطلاعات اصلی">
          <div className="grid gap-4 sm:grid-cols-2">
            {TEXT_FIELDS.map((field) => (
              <Field key={field.key} label={field.label} className={field.full ? 'sm:col-span-2' : ''}>
                {field.area ? (
                  <Textarea rows={4} value={form[field.key] || ''} onChange={set(field.key)} />
                ) : (
                  <Input value={form[field.key] || ''} onChange={set(field.key)} />
                )}
              </Field>
            ))}
          </div>
        </Panel>

        <Panel title="تصاویر صفحه اصلی">
          <div className="grid gap-5 sm:grid-cols-2">
            <UploadField
              label="تصویر Hero"
              value={form.hero_image || ''}
              onChange={(url) => setForm((prev) => ({ ...prev, hero_image: url }))}
              hint="تصویر مستند و محترمانه از فعالیت‌های مجموعه."
            />
            <UploadField
              label="تصویر معرفی مجموعه"
              value={form.about_image || ''}
              onChange={(url) => setForm((prev) => ({ ...prev, about_image: url }))}
            />
          </div>
        </Panel>

        <Panel title="آمار شفافیت">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="تعداد افراد تحت حمایت" hint="فقط اگر آمار رسمی و مستند است وارد کنید">
              <Input value={form.people_supported || ''} onChange={set('people_supported')} inputMode="numeric" dir="ltr" />
            </Field>
            <Field label="تاریخ آخرین به‌روزرسانی گزارش">
              <Input type="date" value={(form.last_updated || '').slice(0, 10)} onChange={set('last_updated')} dir="ltr" />
            </Field>
          </div>
          <p className="mt-3 text-[11px] leading-6 text-muted">
            مجموع کمک‌ها و تعداد پروژه‌ها به‌صورت خودکار از پایگاه داده محاسبه می‌شود و در این فرم
            قابل ویرایش نیست.
          </p>
        </Panel>

        <div className="flex gap-2">
          <Button type="submit" loading={saving}>
            ذخیره تنظیمات
          </Button>
          <Button type="button" variant="ghost" onClick={() => site.refresh()}>
            بازخوانی از سرور
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <Panel title="تغییر رمز عبور" description="رمز عبور جدید باید حداقل ۸ کاراکتر باشد.">
          {passwordNotice && (
            <Notice tone={passwordNotice.tone} className="mb-4">
              {passwordNotice.message}
            </Notice>
          )}
          <form onSubmit={changePassword} className="grid gap-4 sm:grid-cols-2">
            <Field label="رمز عبور فعلی" required>
              <Input
                type="password"
                value={password.current_password}
                onChange={(event) => setPassword((prev) => ({ ...prev, current_password: event.target.value }))}
                autoComplete="current-password"
                dir="ltr"
              />
            </Field>
            <Field label="رمز عبور جدید" required>
              <Input
                type="password"
                value={password.new_password}
                onChange={(event) => setPassword((prev) => ({ ...prev, new_password: event.target.value }))}
                autoComplete="new-password"
                dir="ltr"
              />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" variant="primary" size="sm" loading={passwordBusy}>
                تغییر رمز عبور
              </Button>
            </div>
          </form>
        </Panel>
      </div>
    </>
  )
}

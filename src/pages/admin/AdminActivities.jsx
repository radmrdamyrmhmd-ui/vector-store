import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useResource } from '../../lib/useResource.js'
import { Button, Field, Input, Select, Spinner, Textarea } from '../../components/ui.jsx'
import { AdminHeader, AdminNotice, EmptyRow, Panel, Table, UploadField } from './parts.jsx'
import { num } from '../../lib/format.js'

const EMPTY = {
  title: '',
  slug: '',
  summary: '',
  body: '',
  icon: 'heart',
  image_url: '',
  sort: 0,
  is_active: true,
}

export default function AdminActivities() {
  const { data, loading, error, reload } = useResource(() => api('/admin/activities'), [])
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const activities = data || []

  const set = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function save(event) {
    event.preventDefault()
    if (form.title.trim().length < 3) {
      setNotice({ tone: 'error', message: 'عنوان حوزه فعالیت را وارد کنید.' })
      return
    }
    setSaving(true)
    try {
      if (form.id) {
        await api(`/admin/activities/${form.id}`, { method: 'PUT', body: form })
      } else {
        await api('/admin/activities', { method: 'POST', body: form })
      }
      setNotice({ tone: 'success', message: 'حوزه فعالیت ذخیره شد.' })
      setForm(null)
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function remove(activity) {
    if (!window.confirm(`حوزه «${activity.title}» حذف شود؟`)) return
    try {
      await api(`/admin/activities/${activity.id}`, { method: 'DELETE' })
      setNotice({ tone: 'success', message: 'حوزه فعالیت حذف شد.' })
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    }
  }

  return (
    <>
      <AdminHeader
        title="حوزه‌های فعالیت"
        description="چهار حوزه اصلی سایت از این بخش مدیریت می‌شود؛ عنوان، توضیح، آیکون و تصویر."
        action={
          <Button size="sm" onClick={() => setForm({ ...EMPTY })}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            حوزه جدید
          </Button>
        }
      />

      <AdminNotice notice={notice} onClose={() => setNotice(null)} />
      {error && <AdminNotice notice={{ tone: 'error', message: error }} onClose={() => {}} />}

      {form && (
        <Panel
          className="mb-5"
          title={form.id ? 'ویرایش حوزه فعالیت' : 'حوزه فعالیت جدید'}
          action={
            <button type="button" onClick={() => setForm(null)} aria-label="بستن فرم" className="text-muted hover:text-ink">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          }
        >
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="عنوان" required>
                <Input value={form.title} onChange={set('title')} />
              </Field>
              <Field label="آیکون">
                <Select value={form.icon} onChange={set('icon')}>
                  <option value="book">کتاب (آموزش)</option>
                  <option value="sparkles">درخشش (توانمندسازی)</option>
                  <option value="basket">سبد (معیشت)</option>
                  <option value="heart">قلب و دست (سلامت)</option>
                </Select>
              </Field>
              <Field label="توضیح کوتاه" className="sm:col-span-2">
                <Textarea rows={2} value={form.summary} onChange={set('summary')} />
              </Field>
              <Field label="توضیحات کامل" className="sm:col-span-2">
                <Textarea rows={5} value={form.body} onChange={set('body')} />
              </Field>
              <Field label="ترتیب نمایش">
                <Input value={form.sort ?? 0} onChange={set('sort')} inputMode="numeric" dir="ltr" />
              </Field>
            </div>

            <UploadField
              label="تصویر حوزه"
              value={form.image_url}
              onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
            />

            <label className="flex items-center gap-2 text-[12.5px] text-ink">
              <input type="checkbox" checked={Boolean(form.is_active)} onChange={set('is_active')} className="h-4 w-4 accent-brand" />
              نمایش در وب‌سایت
            </label>

            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={saving}>
                ذخیره
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm(null)}>
                انصراف
              </Button>
            </div>
          </form>
        </Panel>
      )}

      <Panel title={`حوزه‌های فعالیت (${num(activities.length)})`}>
        {loading ? (
          <Spinner />
        ) : (
          <Table head={['عنوان', 'ترتیب', 'وضعیت', 'عملیات']}>
            {activities.length === 0 && <EmptyRow colSpan={4}>حوزه‌ای ثبت نشده است.</EmptyRow>}
            {activities.map((activity) => (
              <tr key={activity.id} className="border-b border-line/70 last:border-0">
                <td className="px-3 py-3">
                  <p className="font-medium text-ink">{activity.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-[10.5px] text-muted">{activity.summary}</p>
                </td>
                <td className="px-3 py-3 text-[11.5px] text-muted">{num(activity.sort)}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] ${activity.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-cream text-muted'}`}>
                    {activity.is_active ? 'فعال' : 'پنهان'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...activity })}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-brand"
                      aria-label={`ویرایش ${activity.title}`}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(activity)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-red-600"
                      aria-label={`حذف ${activity.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </>
  )
}

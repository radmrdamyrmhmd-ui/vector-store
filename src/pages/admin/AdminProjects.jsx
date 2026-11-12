import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useResource } from '../../lib/useResource.js'
import { Button, Field, Input, Select, Spinner, Textarea } from '../../components/ui.jsx'
import { AdminHeader, AdminNotice, EmptyRow, Panel, Table, UploadField } from './parts.jsx'
import { money, num } from '../../lib/format.js'

const EMPTY = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  image_url: '',
  target_amount: '',
  location: '',
  status: 'active',
  is_active: true,
  sort: 0,
}

export default function AdminProjects() {
  const { data, loading, error, reload } = useResource(() => api('/admin/projects'), [])
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const projects = data || []

  const set = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function save(event) {
    event.preventDefault()
    if (form.title.trim().length < 3) {
      setNotice({ tone: 'error', message: 'عنوان پروژه را وارد کنید.' })
      return
    }
    setSaving(true)
    try {
      const payload = { ...form }
      if (form.id) {
        await api(`/admin/projects/${form.id}`, { method: 'PUT', body: payload })
      } else {
        await api('/admin/projects', { method: 'POST', body: payload })
      }
      setNotice({ tone: 'success', message: 'پروژه ذخیره شد.' })
      setForm(null)
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function remove(project) {
    if (!window.confirm(`پروژه «${project.title}» حذف شود؟ این کار قابل بازگشت نیست.`)) return
    try {
      await api(`/admin/projects/${project.id}`, { method: 'DELETE' })
      setNotice({ tone: 'success', message: 'پروژه حذف شد.' })
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    }
  }

  return (
    <>
      <AdminHeader
        title="پروژه‌های حمایتی"
        description="ایجاد و ویرایش پروژه‌ها، هدف مالی و تصاویر. مبالغ جمع‌آوری‌شده به‌صورت خودکار از کمک‌های تأییدشده محاسبه می‌شود."
        action={
          <Button size="sm" onClick={() => setForm({ ...EMPTY })}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            پروژه جدید
          </Button>
        }
      />

      <AdminNotice notice={notice} onClose={() => setNotice(null)} />
      {error && <AdminNotice notice={{ tone: 'error', message: error }} onClose={() => {}} />}

      {form && (
        <Panel
          className="mb-5"
          title={form.id ? 'ویرایش پروژه' : 'پروژه جدید'}
          action={
            <button type="button" onClick={() => setForm(null)} aria-label="بستن فرم" className="text-muted hover:text-ink">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          }
        >
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="عنوان پروژه" htmlFor="project-title" required>
                <Input id="project-title" value={form.title} onChange={set('title')} />
              </Field>
              <Field label="نشانی صفحه (slug)" hint="خالی بگذارید تا خودکار ساخته شود">
                <Input value={form.slug} onChange={set('slug')} dir="ltr" />
              </Field>
              <Field label="خلاصه" htmlFor="project-summary" className="sm:col-span-2">
                <Textarea id="project-summary" rows={2} value={form.summary} onChange={set('summary')} />
              </Field>
              <Field label="توضیحات کامل" className="sm:col-span-2">
                <Textarea rows={5} value={form.description} onChange={set('description')} />
              </Field>
              <Field label="مبلغ موردنیاز (تومان)" hint="اگر ثبت نشود، در سایت «در حال به‌روزرسانی» نمایش داده می‌شود">
                <Input value={form.target_amount || ''} onChange={set('target_amount')} inputMode="numeric" dir="ltr" />
              </Field>
              <Field label="موقعیت اجرا">
                <Input value={form.location || ''} onChange={set('location')} placeholder="مثلاً سیستان و بلوچستان" />
              </Field>
              <Field label="وضعیت">
                <Select value={form.status} onChange={set('status')}>
                  <option value="active">در حال اجرا</option>
                  <option value="completed">تکمیل‌شده</option>
                  <option value="planned">در برنامه‌ریزی</option>
                </Select>
              </Field>
              <Field label="ترتیب نمایش">
                <Input value={form.sort ?? 0} onChange={set('sort')} inputMode="numeric" dir="ltr" />
              </Field>
            </div>

            <UploadField
              label="تصویر پروژه"
              value={form.image_url}
              onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
              hint="JPG، PNG یا WEBP تا ۸ مگابایت. بدون تصویر، طرح نمادین نمایش داده می‌شود."
            />

            <label className="flex items-center gap-2 text-[12.5px] text-ink">
              <input type="checkbox" checked={Boolean(form.is_active)} onChange={set('is_active')} className="h-4 w-4 accent-brand" />
              نمایش در وب‌سایت
            </label>

            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={saving}>
                ذخیره پروژه
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm(null)}>
                انصراف
              </Button>
            </div>
          </form>
        </Panel>
      )}

      <Panel title={`فهرست پروژه‌ها (${num(projects.length)})`}>
        {loading ? (
          <Spinner />
        ) : (
          <Table head={['عنوان', 'وضعیت', 'هدف', 'جمع‌آوری', 'نمایش', 'عملیات']}>
            {projects.length === 0 && <EmptyRow colSpan={6}>هنوز پروژه‌ای ثبت نشده است.</EmptyRow>}
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-line/70 last:border-0">
                <td className="px-3 py-3">
                  <p className="font-medium text-ink">{project.title}</p>
                  <p className="mt-0.5 font-mono text-[10.5px] text-muted" dir="ltr">
                    /{project.slug}
                  </p>
                </td>
                <td className="px-3 py-3 text-[11.5px] text-muted">
                  {project.status === 'completed' ? 'تکمیل‌شده' : project.status === 'planned' ? 'در برنامه‌ریزی' : 'در حال اجرا'}
                </td>
                <td className="px-3 py-3 text-[11.5px] text-muted">
                  {project.target_amount ? money(project.target_amount) : 'ثبت نشده'}
                </td>
                <td className="px-3 py-3 text-[11.5px] text-ink">{money(project.raised_amount)}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] ${project.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-cream text-muted'}`}>
                    {project.is_active ? 'فعال' : 'پنهان'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...project, target_amount: project.target_amount || '' })}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-brand"
                      aria-label={`ویرایش ${project.title}`}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(project)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-red-600"
                      aria-label={`حذف ${project.title}`}
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

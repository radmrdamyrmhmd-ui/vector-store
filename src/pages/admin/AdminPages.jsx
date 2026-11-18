import { useState } from 'react'
import { ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useResource } from '../../lib/useResource.js'
import { Button, Field, Input, Spinner, Textarea } from '../../components/ui.jsx'
import { AdminHeader, AdminNotice, EmptyRow, Panel, Table } from './parts.jsx'
import { formatDate, num } from '../../lib/format.js'

const EMPTY = {
  title: '',
  slug: '',
  subtitle: '',
  body: '',
  meta_title: '',
  meta_description: '',
  is_published: true,
  sort: 0,
}

export default function AdminPages() {
  const { data, loading, error, reload } = useResource(() => api('/admin/pages'), [])
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const pages = data || []

  const set = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function save(event) {
    event.preventDefault()
    if (form.title.trim().length < 3) {
      setNotice({ tone: 'error', message: 'عنوان صفحه را وارد کنید.' })
      return
    }
    setSaving(true)
    try {
      if (form.id) {
        await api(`/admin/pages/${form.id}`, { method: 'PUT', body: form })
      } else {
        await api('/admin/pages', { method: 'POST', body: form })
      }
      setNotice({ tone: 'success', message: 'صفحه ذخیره شد و در سایت به‌روز شد.' })
      setForm(null)
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function remove(page) {
    if (!window.confirm(`صفحه «${page.title}» حذف شود؟`)) return
    try {
      await api(`/admin/pages/${page.id}`, { method: 'DELETE' })
      setNotice({ tone: 'success', message: 'صفحه حذف شد.' })
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    }
  }

  return (
    <>
      <AdminHeader
        title="مدیریت صفحه‌ها"
        description="متن صفحه‌های ثابت سایت (حریم خصوصی، شرایط استفاده و هر صفحه دیگر) از این بخش ویرایش می‌شود. برای تیتر پاراگراف از «## » در ابتدای خط استفاده کنید."
        action={
          <Button size="sm" onClick={() => setForm({ ...EMPTY })}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            صفحه جدید
          </Button>
        }
      />

      <AdminNotice notice={notice} onClose={() => setNotice(null)} />
      {error && <AdminNotice notice={{ tone: 'error', message: error }} onClose={() => {}} />}

      {form && (
        <Panel
          className="mb-5"
          title={form.id ? 'ویرایش صفحه' : 'صفحه جدید'}
          action={
            <button type="button" onClick={() => setForm(null)} aria-label="بستن فرم" className="text-muted hover:text-ink">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          }
        >
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="عنوان صفحه" required>
                <Input value={form.title} onChange={set('title')} />
              </Field>
              <Field label="نشانی صفحه (slug)" hint="صفحه‌های privacy و terms نشانی ثابت دارند">
                <Input value={form.slug || ''} onChange={set('slug')} dir="ltr" />
              </Field>
              <Field label="زیرعنوان / توضیح کوتاه" className="sm:col-span-2">
                <Textarea rows={2} value={form.subtitle || ''} onChange={set('subtitle')} />
              </Field>
              <Field
                label="متن صفحه"
                className="sm:col-span-2"
                hint="یک خط خالی = پاراگراف جدید، «## عنوان» = تیتر بخش، «- مورد» = فهرست"
              >
                <Textarea rows={12} value={form.body || ''} onChange={set('body')} />
              </Field>
              <Field label="عنوان سئو" hint="اگر خالی باشد از عنوان صفحه استفاده می‌شود">
                <Input value={form.meta_title || ''} onChange={set('meta_title')} />
              </Field>
              <Field label="توضیح متای سئو" hint="حدود ۱۵۰ کاراکتر">
                <Input value={form.meta_description || ''} onChange={set('meta_description')} />
              </Field>
              <Field label="ترتیب نمایش">
                <Input type="number" value={form.sort ?? 0} onChange={set('sort')} dir="ltr" />
              </Field>
              <label className="flex items-end gap-2 pb-2 text-[12.5px] text-ink">
                <input
                  type="checkbox"
                  checked={Boolean(form.is_published)}
                  onChange={set('is_published')}
                  className="h-4 w-4 accent-brand"
                />
                نمایش در سایت
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={saving}>
                ذخیره صفحه
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm(null)}>
                انصراف
              </Button>
            </div>
          </form>
        </Panel>
      )}

      <Panel title={`فهرست صفحه‌ها (${num(pages.length)})`}>
        {loading ? (
          <Spinner />
        ) : (
          <Table head={['عنوان', 'نشانی', 'آخرین ویرایش', 'وضعیت', 'عملیات']}>
            {pages.length === 0 && <EmptyRow colSpan={5}>هنوز صفحه‌ای ثبت نشده است.</EmptyRow>}
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-line/70 last:border-0">
                <td className="px-3 py-3">
                  <p className="font-medium text-ink">{page.title}</p>
                  {page.subtitle && (
                    <p className="mt-0.5 line-clamp-1 text-[10.5px] text-muted">{page.subtitle}</p>
                  )}
                </td>
                <td className="px-3 py-3" dir="ltr">
                  <span className="font-mono text-[11px] text-muted">
                    /{['privacy', 'terms'].includes(page.slug) ? page.slug : `p/${page.slug}`}
                  </span>
                </td>
                <td className="px-3 py-3 text-[11.5px] text-muted">{formatDate(page.updated_at)}</td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10.5px] ${
                      page.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-cream text-muted'
                    }`}
                  >
                    {page.is_published ? 'منتشرشده' : 'پیش‌نویس'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/${['privacy', 'terms'].includes(page.slug) ? page.slug : `p/${page.slug}`}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-brand"
                      aria-label={`مشاهده ${page.title}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setForm({ ...page, sort: page.sort ?? 0 })}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-brand"
                      aria-label={`ویرایش ${page.title}`}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(page)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-red-600"
                      aria-label={`حذف ${page.title}`}
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

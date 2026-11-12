import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useResource } from '../../lib/useResource.js'
import { Button, Field, Input, Spinner, Textarea } from '../../components/ui.jsx'
import { AdminHeader, AdminNotice, EmptyRow, Panel, Table, UploadField } from './parts.jsx'
import { formatDate, num } from '../../lib/format.js'

const EMPTY = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  image_url: '',
  author: '',
  published_at: new Date().toISOString().slice(0, 10),
  is_published: false,
}

export default function AdminStories() {
  const { data, loading, error, reload } = useResource(() => api('/admin/stories'), [])
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const stories = data || []

  const set = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function save(event) {
    event.preventDefault()
    if (form.title.trim().length < 3) {
      setNotice({ tone: 'error', message: 'عنوان داستان را وارد کنید.' })
      return
    }
    setSaving(true)
    try {
      if (form.id) {
        await api(`/admin/stories/${form.id}`, { method: 'PUT', body: form })
      } else {
        await api('/admin/stories', { method: 'POST', body: form })
      }
      setNotice({ tone: 'success', message: 'داستان ذخیره شد.' })
      setForm(null)
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function remove(story) {
    if (!window.confirm(`داستان «${story.title}» حذف شود؟`)) return
    try {
      await api(`/admin/stories/${story.id}`, { method: 'DELETE' })
      setNotice({ tone: 'success', message: 'داستان حذف شد.' })
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    }
  }

  return (
    <>
      <AdminHeader
        title="داستان‌ها و اخبار"
        description="روایت‌ها فقط با رضایت آگاهانه افراد منتشر شوند. تا زمان انتشار، داستان به‌صورت پیش‌نویس می‌ماند."
        action={
          <Button size="sm" onClick={() => setForm({ ...EMPTY })}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            داستان جدید
          </Button>
        }
      />

      <AdminNotice notice={notice} onClose={() => setNotice(null)} />
      {error && <AdminNotice notice={{ tone: 'error', message: error }} onClose={() => {}} />}

      {form && (
        <Panel
          className="mb-5"
          title={form.id ? 'ویرایش داستان' : 'داستان جدید'}
          action={
            <button type="button" onClick={() => setForm(null)} aria-label="بستن فرم" className="text-muted hover:text-ink">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          }
        >
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="عنوان" htmlFor="story-title" required>
                <Input id="story-title" value={form.title} onChange={set('title')} />
              </Field>
              <Field label="نشانی صفحه (slug)" hint="خالی بگذارید تا خودکار ساخته شود">
                <Input value={form.slug} onChange={set('slug')} dir="ltr" />
              </Field>
              <Field label="خلاصه" htmlFor="story-excerpt" className="sm:col-span-2">
                <Textarea id="story-excerpt" rows={2} value={form.excerpt} onChange={set('excerpt')} />
              </Field>
              <Field label="متن کامل" htmlFor="story-body" className="sm:col-span-2" hint="برای جداسازی پاراگراف‌ها یک خط خالی بگذارید">
                <Textarea id="story-body" rows={9} value={form.body} onChange={set('body')} />
              </Field>
              <Field label="نویسنده">
                <Input value={form.author || ''} onChange={set('author')} />
              </Field>
              <Field label="تاریخ انتشار">
                <Input type="date" value={(form.published_at || '').slice(0, 10)} onChange={set('published_at')} dir="ltr" />
              </Field>
            </div>

            <UploadField
              label="تصویر داستان"
              value={form.image_url}
              onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
              hint="تصاویر افراد فقط با رضایت آگاهانه منتشر شوند."
            />

            <label className="flex items-center gap-2 text-[12.5px] text-ink">
              <input type="checkbox" checked={Boolean(form.is_published)} onChange={set('is_published')} className="h-4 w-4 accent-brand" />
              انتشار در وب‌سایت
            </label>

            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={saving}>
                ذخیره داستان
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm(null)}>
                انصراف
              </Button>
            </div>
          </form>
        </Panel>
      )}

      <Panel title={`فهرست داستان‌ها (${num(stories.length)})`}>
        {loading ? (
          <Spinner />
        ) : (
          <Table head={['عنوان', 'تاریخ', 'وضعیت', 'عملیات']}>
            {stories.length === 0 && <EmptyRow colSpan={4}>هنوز داستانی ثبت نشده است.</EmptyRow>}
            {stories.map((story) => (
              <tr key={story.id} className="border-b border-line/70 last:border-0">
                <td className="px-3 py-3">
                  <p className="font-medium text-ink">{story.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-[10.5px] text-muted">{story.excerpt}</p>
                </td>
                <td className="px-3 py-3 text-[11.5px] text-muted">{formatDate(story.published_at)}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] ${story.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-cream text-muted'}`}>
                    {story.is_published ? 'منتشرشده' : 'پیش‌نویس'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...story, published_at: (story.published_at || '').slice(0, 10) })}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-brand"
                      aria-label={`ویرایش ${story.title}`}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(story)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-red-600"
                      aria-label={`حذف ${story.title}`}
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

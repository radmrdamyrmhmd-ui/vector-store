import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useResource } from '../../lib/useResource.js'
import { Button, Field, Input, Spinner, Textarea } from '../../components/ui.jsx'
import { AdminHeader, AdminNotice, EmptyRow, Panel, Table, UploadField } from './parts.jsx'
import { formatDate, money, num } from '../../lib/format.js'

const EMPTY = {
  title: '',
  period: '',
  summary: '',
  amount_spent: '',
  file_url: '',
  published_at: new Date().toISOString().slice(0, 10),
}

export default function AdminReports() {
  const { data, loading, error, reload } = useResource(() => api('/admin/reports'), [])
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const reports = data || []

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  async function save(event) {
    event.preventDefault()
    if (form.title.trim().length < 3) {
      setNotice({ tone: 'error', message: 'عنوان گزارش را وارد کنید.' })
      return
    }
    setSaving(true)
    try {
      if (form.id) {
        await api(`/admin/reports/${form.id}`, { method: 'PUT', body: form })
      } else {
        await api('/admin/reports', { method: 'POST', body: form })
      }
      setNotice({ tone: 'success', message: 'گزارش ذخیره شد.' })
      setForm(null)
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function remove(report) {
    if (!window.confirm(`گزارش «${report.title}» حذف شود؟`)) return
    try {
      await api(`/admin/reports/${report.id}`, { method: 'DELETE' })
      setNotice({ tone: 'success', message: 'گزارش حذف شد.' })
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    }
  }

  return (
    <>
      <AdminHeader
        title="گزارش‌های مالی"
        description="گزارش‌های دوره‌ای و فایل PDF آن‌ها. تا زمانی که گزارشی ثبت نشود، صفحه شفافیت «در حال به‌روزرسانی» نمایش می‌دهد."
        action={
          <Button size="sm" onClick={() => setForm({ ...EMPTY })}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            گزارش جدید
          </Button>
        }
      />

      <AdminNotice notice={notice} onClose={() => setNotice(null)} />
      {error && <AdminNotice notice={{ tone: 'error', message: error }} onClose={() => {}} />}

      {form && (
        <Panel
          className="mb-5"
          title={form.id ? 'ویرایش گزارش' : 'گزارش جدید'}
          action={
            <button type="button" onClick={() => setForm(null)} aria-label="بستن فرم" className="text-muted hover:text-ink">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          }
        >
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="عنوان گزارش" required>
                <Input value={form.title} onChange={set('title')} />
              </Field>
              <Field label="دوره" hint="مثلاً نیمه اول ۱۴۰۴">
                <Input value={form.period || ''} onChange={set('period')} />
              </Field>
              <Field label="خلاصه هزینه‌کرد" className="sm:col-span-2">
                <Textarea rows={3} value={form.summary} onChange={set('summary')} />
              </Field>
              <Field label="مبلغ هزینه‌شده (تومان)" hint="اختیاری؛ فقط اگر واقعی است وارد کنید">
                <Input value={form.amount_spent || ''} onChange={set('amount_spent')} inputMode="numeric" dir="ltr" />
              </Field>
              <Field label="تاریخ انتشار">
                <Input type="date" value={(form.published_at || '').slice(0, 10)} onChange={set('published_at')} dir="ltr" />
              </Field>
            </div>

            <UploadField
              label="فایل PDF گزارش"
              value={form.file_url}
              accept=".pdf,application/pdf"
              preview={false}
              onChange={(url) => setForm((prev) => ({ ...prev, file_url: url }))}
              hint="فقط PDF تا ۸ مگابایت."
            />

            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={saving}>
                ذخیره گزارش
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm(null)}>
                انصراف
              </Button>
            </div>
          </form>
        </Panel>
      )}

      <Panel title={`گزارش‌ها (${num(reports.length)})`}>
        {loading ? (
          <Spinner />
        ) : (
          <Table head={['عنوان', 'دوره', 'هزینه‌کرد', 'تاریخ', 'فایل', 'عملیات']}>
            {reports.length === 0 && <EmptyRow colSpan={6}>هنوز گزارشی ثبت نشده است.</EmptyRow>}
            {reports.map((report) => (
              <tr key={report.id} className="border-b border-line/70 last:border-0">
                <td className="px-3 py-3 font-medium text-ink">{report.title}</td>
                <td className="px-3 py-3 text-[11.5px] text-muted">{report.period || '—'}</td>
                <td className="px-3 py-3 text-[11.5px] text-muted">
                  {report.amount_spent ? money(report.amount_spent) : 'ثبت نشده'}
                </td>
                <td className="px-3 py-3 text-[11.5px] text-muted">{formatDate(report.published_at)}</td>
                <td className="px-3 py-3 text-[11.5px]">
                  {report.file_url ? (
                    <a href={report.file_url} target="_blank" rel="noreferrer noopener" className="text-brand underline underline-offset-4">
                      مشاهده
                    </a>
                  ) : (
                    <span className="text-muted">بارگذاری نشده</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...report, published_at: (report.published_at || '').slice(0, 10) })}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-brand"
                      aria-label={`ویرایش ${report.title}`}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(report)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-red-600"
                      aria-label={`حذف ${report.title}`}
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

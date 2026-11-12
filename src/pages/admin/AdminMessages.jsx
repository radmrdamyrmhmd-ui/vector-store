import { useState } from 'react'
import { Mail, MailOpen, Trash2 } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useResource } from '../../lib/useResource.js'
import { Notice, Spinner } from '../../components/ui.jsx'
import { AdminHeader, Panel, Table, EmptyRow } from './parts.jsx'
import { formatDateTime, num } from '../../lib/format.js'

export default function AdminMessages() {
  const { data, loading, error, reload } = useResource(() => api('/admin/messages'), [])
  const subscribers = useResource(() => api('/admin/subscribers'), [])
  const [notice, setNotice] = useState(null)
  const messages = data || []

  async function toggleRead(message) {
    try {
      await api(`/admin/messages/${message.id}`, { method: 'PATCH', body: { is_read: !message.is_read } })
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    }
  }

  async function remove(message) {
    if (!window.confirm('این پیام حذف شود؟')) return
    try {
      await api(`/admin/messages/${message.id}`, { method: 'DELETE' })
      setNotice({ tone: 'success', message: 'پیام حذف شد.' })
      reload()
    } catch (err) {
      setNotice({ tone: 'error', message: err.message })
    }
  }

  return (
    <>
      <AdminHeader
        title="پیام‌ها و خبرنامه"
        description="پیام‌های فرم تماس و اعضای خبرنامه. اطلاعات تماس ارسال‌کنندگان محرمانه است."
      />

      {error && <Notice tone="error" className="mb-5">{error}</Notice>}
      {notice && <Notice tone={notice.tone} className="mb-5">{notice.message}</Notice>}

      <Panel title={`پیام‌های تماس (${num(messages.length)})`} className="mb-5">
        {loading ? (
          <Spinner />
        ) : (
          <Table head={['وضعیت', 'نام', 'موضوع', 'تماس', 'تاریخ', 'عملیات']}>
            {messages.length === 0 && <EmptyRow colSpan={6}>پیامی دریافت نشده است.</EmptyRow>}
            {messages.map((message) => (
              <tr key={message.id} className={`border-b border-line/70 last:border-0 ${message.is_read ? '' : 'bg-brand-50/30'}`}>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] ${message.is_read ? 'bg-cream text-muted' : 'bg-accent-soft text-accent-dark'}`}>
                    {message.is_read ? 'خوانده‌شده' : 'جدید'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium text-ink">{message.name}</p>
                  <p className="mt-1 max-w-md text-[10.5px] leading-6 text-muted">{message.message}</p>
                </td>
                <td className="px-3 py-3 text-[11.5px] text-muted">{message.subject || '—'}</td>
                <td className="px-3 py-3 text-[10.5px] text-muted">
                  {message.phone && <p dir="ltr">{message.phone}</p>}
                  {message.email && <p dir="ltr">{message.email}</p>}
                </td>
                <td className="px-3 py-3 text-[10.5px] text-muted">{formatDateTime(message.created_at)}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleRead(message)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-brand"
                      aria-label="تغییر وضعیت خوانده‌شدن"
                    >
                      {message.is_read ? <Mail className="h-3.5 w-3.5" aria-hidden="true" /> : <MailOpen className="h-3.5 w-3.5" aria-hidden="true" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(message)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:text-red-600"
                      aria-label="حذف پیام"
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

      <Panel title={`اعضای خبرنامه (${num((subscribers.data || []).length)})`}>
        {subscribers.loading ? (
          <Spinner />
        ) : (subscribers.data || []).length === 0 ? (
          <p className="py-6 text-center text-[12px] text-muted">هنوز عضوی ثبت نشده است.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {subscribers.data.map((subscriber) => (
              <li
                key={subscriber.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-2.5 text-[11.5px]"
              >
                <span dir="ltr" className="text-ink">{subscriber.email}</span>
                <span className="text-[10px] text-muted">{formatDateTime(subscriber.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  )
}

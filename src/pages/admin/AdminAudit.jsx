import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useResource } from '../../lib/useResource.js'
import { Button, Spinner } from '../../components/ui.jsx'
import { AdminHeader, AdminNotice, EmptyRow, Panel, Table } from './parts.jsx'
import { formatDateTime, num } from '../../lib/format.js'

const ACTION_LABELS = {
  login: 'ورود موفق',
  logout: 'خروج',
  login_failed: 'تلاش ناموفق ورود',
  create: 'ایجاد',
  update: 'ویرایش',
  delete: 'حذف',
  request_failed: 'درخواست ناموفق',
  password_changed: 'تغییر رمز خود',
  password_reset: 'بازنشانی رمز کاربر',
}

const ACTION_TONES = {
  login: 'bg-emerald-50 text-emerald-700',
  logout: 'bg-cream text-muted',
  login_failed: 'bg-red-50 text-red-700',
  create: 'bg-brand-50 text-brand',
  update: 'bg-amber-50 text-amber-800',
  delete: 'bg-red-50 text-red-700',
  request_failed: 'bg-red-50 text-red-700',
}

const humanize = (entity = '') =>
  String(entity)
    .replace('/api/admin/', '')
    .replace(/\/\d+$/, '')
    .replace(/\//g, ' › ')

export default function AdminAudit() {
  const [action, setAction] = useState('')
  const { data, loading, error, reload } = useResource(
    () => api(`/admin/audit?action=${action}`),
    [action]
  )
  const items = data?.items || []
  const actions = data?.actions || []

  return (
    <>
      <AdminHeader
        title="گزارش فعالیت مدیران"
        description="هر ورود، ویرایش، حذف و تغییر کاربر با زمان و نشانی شبکه ثبت می‌شود. این گزارش فقط برای مدیر کل قابل مشاهده است."
        action={
          <Button size="sm" variant="outline" onClick={reload}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            به‌روزرسانی
          </Button>
        }
      />

      {error && <AdminNotice notice={{ tone: 'error', message: error }} onClose={() => {}} />}

      <div className="mb-5 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setAction('')}
          className={`rounded-full px-3 py-1.5 text-[11px] transition ${
            action === '' ? 'bg-brand text-cream' : 'bg-white text-muted hover:text-brand'
          }`}
        >
          همه رویدادها
        </button>
        {actions.map((item) => (
          <button
            key={item.action}
            type="button"
            onClick={() => setAction(item.action)}
            className={`rounded-full px-3 py-1.5 text-[11px] transition ${
              action === item.action ? 'bg-brand text-cream' : 'bg-white text-muted hover:text-brand'
            }`}
          >
            {ACTION_LABELS[item.action] || item.action} ({num(item.c)})
          </button>
        ))}
      </div>

      <Panel title={`رویدادها (${num(items.length)})`} description="جدیدترین رویدادها در بالای فهرست قرار دارند.">
        {loading ? (
          <Spinner />
        ) : (
          <Table head={['زمان', 'کاربر', 'رویداد', 'بخش', 'جزئیات', 'IP']}>
            {items.length === 0 && <EmptyRow colSpan={6}>رویدادی ثبت نشده است.</EmptyRow>}
            {items.map((item) => (
              <tr key={item.id} className="border-b border-line/70 last:border-0">
                <td className="whitespace-nowrap px-3 py-3 text-[11px] text-muted">
                  {formatDateTime(item.created_at)}
                </td>
                <td className="px-3 py-3 text-[11.5px] text-ink" dir="ltr">
                  {item.user_email || '—'}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10.5px] ${
                      ACTION_TONES[item.action] || 'bg-cream text-muted'
                    }`}
                  >
                    {ACTION_LABELS[item.action] || item.action}
                  </span>
                </td>
                <td className="px-3 py-3 text-[11px] text-muted">{humanize(item.entity) || '—'}</td>
                <td className="px-3 py-3 text-[10.5px] text-muted" dir="ltr">
                  <span className="line-clamp-2 max-w-[240px]">{item.detail || '—'}</span>
                </td>
                <td className="px-3 py-3 text-[10.5px] text-muted" dir="ltr">
                  {item.ip || '—'}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </>
  )
}

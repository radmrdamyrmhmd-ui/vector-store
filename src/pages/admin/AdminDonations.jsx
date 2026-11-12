import { useState } from 'react'
import { api } from '../../lib/api.js'
import { useResource } from '../../lib/useResource.js'
import { Notice, Spinner } from '../../components/ui.jsx'
import { AdminHeader, Panel, StatusPill, Table, EmptyRow } from './parts.jsx'
import { formatDateTime, money, num } from '../../lib/format.js'

const FILTERS = [
  { key: '', label: 'همه' },
  { key: 'paid', label: 'تأییدشده' },
  { key: 'pending', label: 'در انتظار' },
  { key: 'failed', label: 'ناموفق' },
  { key: 'canceled', label: 'لغوشده' },
]

const TOTALS_LABELS = {
  paid: 'تأییدشده',
  pending: 'در انتظار',
  failed: 'ناموفق',
  canceled: 'لغوشده',
}

export default function AdminDonations() {
  const [filter, setFilter] = useState('')
  const { data, loading, error } = useResource(
    () => api(`/admin/donations${filter ? `?status=${filter}` : ''}`),
    [filter]
  )
  const items = data?.items || []
  const totals = data?.totals || []

  return (
    <>
      <AdminHeader
        title="کمک‌های ثبت‌شده"
        description="این فهرست فقط برای مدیران مجاز قابل مشاهده است. تراکنش فقط پس از تأیید درگاه «تأییدشده» می‌شود."
      />

      {error && <Notice tone="error" className="mb-5">{error}</Notice>}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {totals.map((row) => (
          <div key={row.status} className="rounded-[20px] border border-line bg-white px-5 py-4">
            <p className="text-[11px] text-muted">{TOTALS_LABELS[row.status] || row.status}</p>
            <p className="mt-1.5 text-[16px] font-semibold text-ink">{money(row.total)}</p>
            <p className="mt-0.5 text-[10.5px] text-muted">{num(row.count)} تراکنش</p>
          </div>
        ))}
        {totals.length === 0 && (
          <p className="text-[12px] text-muted">هنوز تراکنشی ثبت نشده است.</p>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.key || 'all'}
            type="button"
            onClick={() => setFilter(item.key)}
            aria-pressed={filter === item.key}
            className={`rounded-full px-4 py-2 text-[12px] transition ${
              filter === item.key
                ? 'bg-brand text-cream'
                : 'border border-line bg-white text-ink/70 hover:text-brand'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Panel title={`فهرست تراکنش‌ها (${num(items.length)})`}>
        {loading ? (
          <Spinner />
        ) : (
          <Table head={['کد پیگیری', 'مبلغ', 'پروژه', 'اهداکننده', 'موبایل', 'وضعیت', 'تاریخ', 'مرجع درگاه']}>
            {items.length === 0 && <EmptyRow colSpan={8}>تراکنشی با این وضعیت وجود ندارد.</EmptyRow>}
            {items.map((donation) => (
              <tr key={donation.id} className="border-b border-line/70 last:border-0">
                <td className="px-3 py-3 font-mono text-[10.5px] text-muted" dir="ltr">
                  {donation.tracking_code}
                </td>
                <td className="px-3 py-3 font-medium text-ink">{money(donation.amount)}</td>
                <td className="px-3 py-3 text-[11.5px] text-muted">{donation.project_title || 'کلیه فعالیت‌ها'}</td>
                <td className="px-3 py-3 text-[11.5px] text-ink">
                  {donation.is_anonymous ? 'کمک ناشناس' : donation.donor_name || '—'}
                </td>
                <td className="px-3 py-3 font-mono text-[10.5px] text-muted" dir="ltr">
                  {donation.donor_phone || '—'}
                </td>
                <td className="px-3 py-3">
                  <StatusPill status={donation.status} />
                </td>
                <td className="px-3 py-3 text-[10.5px] text-muted">{formatDateTime(donation.created_at)}</td>
                <td className="px-3 py-3 font-mono text-[10px] text-muted" dir="ltr">
                  {donation.gateway_reference || '—'}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <p className="mt-4 rounded-2xl border border-line bg-white px-5 py-4 text-[11px] leading-6 text-muted">
        اطلاعات تماس اهداکنندگان فقط برای هماهنگی و ارسال رسید استفاده می‌شود و نباید در گزارش‌های
        عمومی منتشر شود. برای تغییر وضعیت تراکنش، از پنل درگاه پرداخت استفاده کنید؛ این سامانه وضعیت
        پرداخت را به‌صورت دستی «موفق» نمی‌کند تا آمار مالی واقعی بماند.
      </p>
    </>
  )
}

import { Link } from 'react-router-dom'
import {
  CalendarClock,
  FileText,
  HandCoins,
  Mail,
  Users,
} from 'lucide-react'
import { api } from '../../lib/api.js'
import { useResource } from '../../lib/useResource.js'
import { Spinner, Notice } from '../../components/ui.jsx'
import { AdminHeader, Panel, StatusPill } from './parts.jsx'
import { formatDateTime, money, num } from '../../lib/format.js'

export default function AdminDashboard() {
  const { data, loading, error } = useResource(() => api('/admin/stats'), [])

  if (loading) return <Spinner />
  if (error) return <Notice tone="error">{error}</Notice>

  const cards = [
    { label: 'کمک‌های تأییدشده', value: money(data.donations.paid_total), hint: `${num(data.donations.paid_count)} تراکنش`, icon: HandCoins, to: '/admin/donations' },
    { label: 'در انتظار پرداخت', value: num(data.donations.pending_count), hint: 'درخواست‌های ثبت‌شده', icon: CalendarClock, to: '/admin/donations' },
    { label: 'درخواست داوطلبی جدید', value: num(data.counts.new_volunteers), hint: 'بررسی‌نشده', icon: Users, to: '/admin/volunteers' },
    { label: 'پیام‌های خوانده‌نشده', value: num(data.counts.unread_messages), hint: 'فرم تماس', icon: Mail, to: '/admin/messages' },
  ]

  return (
    <>
      <AdminHeader
        title="داشبورد"
        description="خلاصه وضعیت مجموعه؛ همه اعداد از پایگاه داده خوانده می‌شود."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, hint, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="rounded-[20px] border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-[10.5px] text-muted">{hint}</span>
            </div>
            <p className="mt-4 text-[18px] font-semibold text-ink">{value}</p>
            <p className="mt-1 text-[11.5px] text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="آخرین کمک‌های ثبت‌شده" description="شامل تراکنش‌های در انتظار و تأییدشده">
          <div className="space-y-2.5">
            {data.recentDonations.length === 0 && (
              <p className="py-6 text-center text-[12px] text-muted">هنوز کمکی ثبت نشده است.</p>
            )}
            {data.recentDonations.map((donation) => (
              <div
                key={donation.tracking_code}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-4 py-3"
              >
                <div>
                  <p className="text-[12.5px] font-medium text-ink">{money(donation.amount)}</p>
                  <p className="mt-0.5 text-[10.5px] text-muted">
                    {donation.project_title || 'کلیه فعالیت‌ها'} · {formatDateTime(donation.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10.5px] text-muted">{donation.tracking_code}</span>
                  <StatusPill status={donation.status} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="خلاصه محتوا">
            <ul className="space-y-3 text-[12.5px]">
              <li className="flex items-center justify-between">
                <span className="text-muted">پروژه‌ها</span>
                <span className="font-medium text-ink">{num(data.counts.projects)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted">داستان‌ها</span>
                <span className="font-medium text-ink">{num(data.counts.stories)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted">حوزه‌های فعالیت</span>
                <span className="font-medium text-ink">{num(data.counts.activities)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted">اعضای خبرنامه</span>
                <span className="font-medium text-ink">{num(data.counts.subscribers)}</span>
              </li>
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                to="/admin/projects"
                className="rounded-xl border border-line px-3 py-2 text-center text-[11.5px] text-brand transition hover:bg-brand-50"
              >
                مدیریت پروژه‌ها
              </Link>
              <Link
                to="/admin/stories"
                className="rounded-xl border border-line px-3 py-2 text-center text-[11.5px] text-brand transition hover:bg-brand-50"
              >
                مدیریت داستان‌ها
              </Link>
              <Link
                to="/admin/reports"
                className="rounded-xl border border-line px-3 py-2 text-center text-[11.5px] text-brand transition hover:bg-brand-50"
              >
                گزارش مالی
              </Link>
              <Link
                to="/admin/settings"
                className="rounded-xl border border-line px-3 py-2 text-center text-[11.5px] text-brand transition hover:bg-brand-50"
              >
                تنظیمات سایت
              </Link>
            </div>
          </Panel>

          <Panel title="آخرین داوطلبان">
            <ul className="space-y-2.5">
              {data.recentVolunteers.length === 0 && (
                <li className="py-4 text-center text-[12px] text-muted">درخواستی ثبت نشده است.</li>
              )}
              {data.recentVolunteers.map((volunteer) => (
                <li key={volunteer.id} className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="text-ink">{volunteer.full_name}</span>
                  <span className="text-[10.5px] text-muted">{volunteer.city || '—'}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <p className="mt-5 flex items-start gap-2 text-[11px] leading-6 text-muted">
        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        اعداد مالی فقط از تراکنش‌های تأییدشده محاسبه می‌شود. تراکنش‌های در انتظار، در گزارش عمومی
        سایت به‌عنوان کمک دریافتی نمایش داده نمی‌شوند.
      </p>
    </>
  )
}

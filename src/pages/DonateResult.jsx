import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { api } from '../lib/api.js'
import { useResource } from '../lib/useResource.js'
import { Button, Empty } from '../components/ui.jsx'
import { formatDateTime, money } from '../lib/format.js'

const STATES = {
  paid: {
    tone: 'success',
    icon: CheckCircle2,
    title: 'کمک شما با موفقیت تأیید شد',
    text: 'پرداخت شما توسط درگاه تأیید شده است. رسید و گزارش مالی در بخش شفافیت به‌روزرسانی می‌شود.',
  },
  canceled: {
    tone: 'warning',
    icon: XCircle,
    title: 'پرداخت تکمیل نشد',
    text: 'تراکنش لغو شد و مبلغی از حساب شما کسر نشده است. می‌توانید دوباره تلاش کنید.',
  },
  failed: {
    tone: 'error',
    icon: AlertTriangle,
    title: 'پرداخت تأیید نشد',
    text: 'درگاه پرداخت این تراکنش را تأیید نکرد. اگر مبلغی کسر شده باشد، طبق قوانین درگاه بازگردانده می‌شود.',
  },
  pending: {
    tone: 'info',
    icon: Clock,
    title: 'در انتظار تأیید پرداخت',
    text: 'این درخواست ثبت شده اما پرداخت آن هنوز تأیید نشده است؛ بنابراین در گزارش مالی به‌عنوان کمک دریافت‌شده ثبت نمی‌شود.',
  },
  not_found: {
    tone: 'warning',
    icon: AlertTriangle,
    title: 'اطلاعات این تراکنش پیدا نشد',
    text: 'کد پیگیری را بررسی کنید یا با مجموعه تماس بگیرید.',
  },
}

export default function DonateResult() {
  const [params] = useSearchParams()
  const tracking = params.get('tracking') || ''
  const queryState = params.get('state') || ''
  const { data: donation, loading, error } = useResource(
    () => (tracking ? api(`/donations/${encodeURIComponent(tracking)}`) : Promise.resolve(null)),
    [tracking]
  )

  const statusKey = queryState === 'not_found' ? 'not_found' : donation?.status || queryState || 'pending'
  const view = STATES[statusKey] || STATES.pending
  const Icon = view.icon

  return (
    <section className="py-16 sm:py-20">
      <div className="container-x max-w-2xl">
        {loading ? (
          <div className="h-64 animate-pulse rounded-[28px] bg-cream/70" />
        ) : error ? (
          <Empty
            title="اطلاعات تراکنش در دسترس نیست"
            text={error}
            action={
              <Button to="/donate" variant="outline" size="sm">
                بازگشت به صفحه حمایت مالی
              </Button>
            }
          />
        ) : (
          <div className="rounded-[28px] border border-line bg-white p-7 sm:p-10">
            <span
              className={`grid h-14 w-14 place-items-center rounded-2xl ${
                view.tone === 'success'
                  ? 'bg-emerald-50 text-emerald-600'
                  : view.tone === 'error'
                    ? 'bg-red-50 text-red-600'
                    : view.tone === 'warning'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-brand-50 text-brand'
              }`}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-[24px] leading-[1.5] text-ink">{view.title}</h1>
            <p className="mt-3 text-[13.5px] leading-8 text-muted">{view.text}</p>

            <dl className="mt-6 space-y-3 rounded-2xl border border-line bg-cream/50 px-5 py-4 text-[12.5px]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">کد پیگیری</dt>
                <dd className="font-mono tracking-widest text-ink">{donation?.tracking_code || tracking || '—'}</dd>
              </div>
              {donation?.amount && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">مبلغ</dt>
                  <dd className="font-medium text-ink">{money(donation.amount)}</dd>
                </div>
              )}
              {donation?.project_title && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">پروژه</dt>
                  <dd className="text-ink">{donation.project_title}</dd>
                </div>
              )}
              {donation?.created_at && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">تاریخ ثبت</dt>
                  <dd className="text-ink">{formatDateTime(donation.created_at)}</dd>
                </div>
              )}
              {donation?.paid_at && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">تاریخ تأیید</dt>
                  <dd className="text-ink">{formatDateTime(donation.paid_at)}</dd>
                </div>
              )}
            </dl>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button to="/donate" size="sm">
                ثبت کمک جدید
              </Button>
              <Button to="/transparency" variant="outline" size="sm">
                گزارش شفافیت مالی
              </Button>
              <Button to="/" variant="ghost" size="sm">
                صفحه اصلی
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

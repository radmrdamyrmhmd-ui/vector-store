import { useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock3, Printer, XCircle } from 'lucide-react'
import { api } from '../lib/api.js'
import { useResource } from '../lib/useResource.js'
import { Button, Notice } from '../components/ui.jsx'
import { SimulatedTag } from '../components/DemoRibbon.jsx'
import { formatDateTime, money } from '../lib/format.js'
import { useSeo } from '../lib/seo.jsx'

export default function DonateResult() {
  const params = useParams()
  const [search] = useSearchParams()
  const tracking = params.tracking || search.get('tracking') || ''
  const { data, loading, error } = useResource(
    () => (tracking ? api(`/donations/${tracking}`) : Promise.resolve(null)),
    [tracking]
  )

  useSeo({ title: 'نتیجه کمک', noindex: true, path: `/donate/result/${tracking}` })

  if (!tracking) {
    return (
      <div className="container-x max-w-2xl py-20">
        <Notice tone="warning">کد پیگیری مشخص نشده است.</Notice>
        <div className="mt-4">
          <Button to="/donate" variant="outline" size="sm">
            بازگشت به فرم کمک
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container-x max-w-2xl py-20">
        <div className="h-64 animate-pulse rounded-[26px] bg-cream/70" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container-x max-w-2xl py-20">
        <Notice tone="error">{error || 'کد پیگیری پیدا نشد.'}</Notice>
        <div className="mt-4">
          <Button to="/donate" variant="outline" size="sm">
            ثبت کمک جدید
          </Button>
        </div>
      </div>
    )
  }

  const paid = data.status === 'paid'
  const canceled = data.status === 'canceled'

  return (
    <section className="py-12 sm:py-20">
      <div className="container-x max-w-2xl">
        <div className="card-surface overflow-hidden">
          <div
            className={`px-6 py-8 text-center sm:px-10 ${
              paid ? 'bg-emerald-50/60' : canceled ? 'bg-cream/60' : 'bg-amber-50/60'
            }`}
          >
            <span
              className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${
                paid
                  ? 'bg-emerald-100 text-emerald-700'
                  : canceled
                    ? 'bg-white text-muted'
                    : 'bg-amber-100 text-amber-700'
              }`}
            >
              {paid ? (
                <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
              ) : canceled ? (
                <XCircle className="h-7 w-7" aria-hidden="true" />
              ) : (
                <Clock3 className="h-7 w-7" aria-hidden="true" />
              )}
            </span>
            <h1 className="mt-4 text-[22px] leading-9 text-ink sm:text-[26px]">
              {paid
                ? 'کمک شما (به‌صورت آزمایشی) ثبت شد'
                : canceled
                  ? 'این کمک لغو شد'
                  : 'این کمک در انتظار تأیید است'}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-7 text-muted">
              {paid &&
                'این نتیجه یک پرداخت شبیه‌سازی‌شده است. در یک استقرار واقعی، همین مرحله پس از تأیید درگاه بانکی نمایش داده می‌شود.'}
              {canceled &&
                'پرداخت آزمایشی انجام نشد و هیچ رکوردی به‌عنوان کمک دریافت‌شده ثبت نشده است.'}
              {!paid &&
                !canceled &&
                'این رکورد هنوز پرداخت نشده است. می‌توانید مرحله تأیید پرداخت را دوباره انجام دهید.'}
            </p>
            {paid && <SimulatedTag className="mt-4" />}
          </div>

          <div className="p-6 sm:p-8">
            <dl className="divide-y divide-line text-[13px]">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-muted">مبلغ</dt>
                <dd className="font-semibold text-ink">{money(data.amount)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-muted">پروژه</dt>
                <dd className="text-ink">{data.project_title || 'کلیه فعالیت‌ها'}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-muted">کد پیگیری</dt>
                <dd className="font-mono text-[13px] tracking-widest text-ink">{data.tracking_code}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-muted">تاریخ ثبت</dt>
                <dd className="text-ink">{formatDateTime(data.created_at)}</dd>
              </div>
              {data.paid_at && (
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-muted">تاریخ تأیید آزمایشی</dt>
                  <dd className="text-ink">{formatDateTime(data.paid_at)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-muted">وضعیت</dt>
                <dd className="text-ink">
                  {paid ? 'پرداخت شبیه‌سازی‌شده' : canceled ? 'لغوشده' : 'در انتظار پرداخت'}
                </dd>
              </div>
            </dl>

            {paid && (
              <Notice tone="info" className="mt-5">
                هیچ مبلغی از حساب شما کسر نشده و این رکورد در آمار «کمک‌های دریافت‌شده» سایت
                محاسبه نمی‌شود.
              </Notice>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              {!paid && !canceled && (
                <Button to={`/donate/checkout/${data.tracking_code}`} size="sm">
                  ادامه پرداخت آزمایشی
                </Button>
              )}
              <Button to="/transparency" variant="outline" size="sm">
                گزارش‌ها و شفافیت
              </Button>
              <Button to="/" variant="ghost" size="sm">
                بازگشت به صفحه اصلی
              </Button>
              {paid && (
                <Button variant="ghost" size="sm" onClick={() => window.print()}>
                  <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                  چاپ رسید
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

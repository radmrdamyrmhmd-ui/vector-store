import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CreditCard, FlaskConical, LockKeyhole, RefreshCw, XCircle } from 'lucide-react'
import { api } from '../lib/api.js'
import { useResource } from '../lib/useResource.js'
import { Button, Notice, PageHero } from '../components/ui.jsx'
import { Breadcrumbs } from '../components/blocks.jsx'
import { SimulatedTag } from '../components/DemoRibbon.jsx'
import { formatDateTime, money } from '../lib/format.js'
import { useSeo } from '../lib/seo.jsx'

export default function DonateCheckout() {
  const { tracking } = useParams()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useResource(
    () => api(`/donations/${tracking}`),
    [tracking]
  )
  const [busy, setBusy] = useState('')
  const [failure, setFailure] = useState('')

  useSeo({
    title: 'تأیید پرداخت شبیه‌سازی‌شده',
    noindex: true,
    path: `/donate/checkout/${tracking}`,
  })

  async function confirm() {
    setBusy('pay')
    setFailure('')
    try {
      await api(`/donations/${tracking}/simulate`, { method: 'POST' })
      navigate(`/donate/result/${tracking}`, { replace: true })
    } catch (err) {
      setFailure(err.message)
      setBusy('')
    }
  }

  async function cancel() {
    setBusy('cancel')
    setFailure('')
    try {
      await api(`/donations/${tracking}/cancel`, { method: 'POST' })
      navigate(`/donate/result/${tracking}`, { replace: true })
    } catch (err) {
      setFailure(err.message)
      setBusy('')
    }
  }

  if (loading) {
    return (
      <div className="container-x max-w-2xl py-20">
        <div className="h-56 animate-pulse rounded-[26px] bg-cream/70" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container-x max-w-2xl py-20">
        <Notice tone="error">{error || 'کد پیگیری پیدا نشد.'}</Notice>
        <div className="mt-4">
          <Button to="/donate" variant="outline" size="sm">
            بازگشت به فرم کمک
          </Button>
        </div>
      </div>
    )
  }

  if (data.status === 'paid') {
    return (
      <div className="container-x max-w-2xl py-20">
        <Notice tone="success">این کمک قبلاً ثبت شده است.</Notice>
        <div className="mt-4">
          <Button to={`/donate/result/${data.tracking_code}`} size="sm">
            مشاهده نتیجه
          </Button>
        </div>
      </div>
    )
  }

  if (data.status === 'canceled') {
    return (
      <div className="container-x max-w-2xl py-20">
        <Notice tone="warning">این کمک لغو شده است.</Notice>
        <div className="mt-4">
          <Button to="/donate" variant="outline" size="sm">
            شروع یک کمک جدید
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHero
        eyebrow="مرحله سوم"
        title="تأیید و پرداخت"
        text="این صفحه جایگزین درگاه بانکی است و فقط برای نمایش جریان پرداخت در نمونه‌کار طراحی شده است."
      />

      <section className="py-12 sm:py-16">
        <div className="container-x max-w-2xl">
          <Breadcrumbs items={[{ label: 'حمایت مالی', to: '/donate' }, { label: 'تأیید و پرداخت' }]} />

          <div className="card-surface overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-cream/50 px-6 py-4">
              <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
                <CreditCard className="h-4 w-4 text-brand" aria-hidden="true" />
                صفحه پرداخت آزمایشی
              </span>
              <SimulatedTag />
            </div>

            <div className="p-6 sm:p-8">
              <Notice tone="warning">
                <p className="font-medium">این پرداخت واقعی نیست.</p>
                <p>
                  هیچ اطلاعات کارت بانکی درخواست نمی‌شود و هیچ مبلغی از حساب شما کسر نمی‌گردد.
                  با تأیید این مرحله فقط یک رکورد آزمایشی با برچسب «پرداخت شبیه‌سازی‌شده» ثبت می‌شود.
                </p>
              </Notice>

              <dl className="mt-6 divide-y divide-line text-[13px]">
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
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-muted">وضعیت</dt>
                  <dd className="text-ink">در انتظار تأیید</dd>
                </div>
              </dl>

              {failure && (
                <Notice tone="error" className="mt-5">
                  {failure}
                  <button
                    type="button"
                    onClick={reload}
                    className="mt-2 flex items-center gap-1.5 text-[12px] font-medium underline underline-offset-4"
                  >
                    <RefreshCw className="h-3 w-3" aria-hidden="true" />
                    تلاش دوباره برای دریافت وضعیت
                  </button>
                </Notice>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button onClick={confirm} loading={busy === 'pay'} className="sm:flex-1">
                  <FlaskConical className="h-4 w-4" aria-hidden="true" />
                  تأیید پرداخت شبیه‌سازی‌شده
                </Button>
                <Button variant="outline" onClick={cancel} loading={busy === 'cancel'}>
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  انصراف
                </Button>
              </div>

              <p className="mt-5 flex items-start gap-2 text-[11.5px] leading-6 text-muted">
                <LockKeyhole className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                در یک استقرار واقعی، این مرحله به درگاه بانکی منتقل می‌شود و نتیجه فقط پس از تأیید
                درگاه ثبت می‌گردد. برای دیدن ساختار کد، به مستندات پروژه مراجعه کنید.
              </p>

              <p className="mt-3 text-[11.5px] leading-6 text-muted">
                <ArrowLeft className="ml-1 inline h-3 w-3" aria-hidden="true" />
                برای تغییر مبلغ یا اطلاعات،{' '}
                <Link to="/donate" className="text-brand underline underline-offset-4">
                  به فرم کمک بازگردید
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

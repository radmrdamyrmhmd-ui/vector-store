import { useSearchParams } from 'react-router-dom'
import { BadgeCheck, FlaskConical, HeartHandshake, ShieldCheck } from 'lucide-react'
import { api } from '../lib/api.js'
import { useResource } from '../lib/useResource.js'
import { useSettings } from '../lib/site.jsx'
import DonateWizard from '../components/DonateWizard.jsx'
import { Notice, PageHero } from '../components/ui.jsx'
import { Breadcrumbs } from '../components/blocks.jsx'
import { useSeo, breadcrumbJsonLd } from '../lib/seo.jsx'

export default function Donate() {
  const [params] = useSearchParams()
  const { data: projects } = useResource(() => api('/projects'), [])
  const settings = useSettings()

  useSeo({
    title: 'حمایت مالی',
    description:
      'انتخاب مبلغ و پروژه برای حمایت از آموزش، توانمندسازی و سلامت زنان و کودکان بلوچ. در این نسخه، پرداخت شبیه‌سازی‌شده است.',
    path: '/donate',
    jsonLd: breadcrumbJsonLd([
      { label: 'صفحه اصلی', to: '/' },
      { label: 'حمایت مالی', to: '/donate' },
    ]),
  })

  return (
    <>
      <PageHero
        eyebrow="حمایت مالی"
        title="سهم تو در ساختن آینده‌ای بهتر"
        text="با هر میزان کمک می‌توانی در مسیر آموزش، سلامت و توانمندسازی زنان و کودکان بلوچ همراه ما باشی."
      />

      <section className="py-12 sm:py-16">
        <div className="container-x">
          <Breadcrumbs items={[{ label: 'حمایت مالی' }]} />

          <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <DonateWizard projects={projects || []} initialSlug={params.get('project') || ''} />

            <aside className="space-y-4">
              <Notice tone="warning">
                <p className="flex items-center gap-1.5 font-medium">
                  <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                  پرداخت شبیه‌سازی‌شده
                </p>
                <p>
                  {settings.donation_notice ||
                    'پرداخت در این نسخه شبیه‌سازی می‌شود. هیچ اطلاعات کارت بانکی دریافت نمی‌شود و مبلغی از حساب شما کسر نمی‌گردد.'}
                </p>
              </Notice>

              <div className="rounded-[26px] border border-line bg-white p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-[16px] text-ink">چه چیزی ثبت می‌شود؟</h2>
                <ul className="mt-3 space-y-3 text-[12.5px] leading-7 text-muted">
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                    یک رکورد آزمایشی با کد پیگیری یکتا و برچسب «پرداخت شبیه‌سازی‌شده».
                  </li>
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                    مشخصات اهداکننده فقط در پنل مدیریت قابل مشاهده است و در صفحات عمومی نمایش داده
                    نمی‌شود.
                  </li>
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                    کمک‌های شبیه‌سازی‌شده در آمار «کمک‌های دریافت‌شده» محاسبه نمی‌شوند.
                  </li>
                </ul>
              </div>

              <div className="rounded-[26px] border border-line bg-cream/60 p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-accent-dark">
                  <HeartHandshake className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-[16px] text-ink">راه‌های دیگر همراهی</h2>
                <p className="mt-2 text-[12.5px] leading-7 text-muted">
                  اگر ترجیح می‌دهید به‌جای کمک مالی، زمان و مهارت خود را در اختیار بگذارید، از فرم
                  داوطلبی استفاده کنید. برای هماهنگی سایر روش‌ها هم می‌توانید پیام بدهید.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
                  <a
                    href="/volunteer"
                    className="rounded-full border border-brand/25 px-4 py-2 text-brand transition hover:bg-white"
                  >
                    فرم داوطلبی
                  </a>
                  <a
                    href="/contact"
                    className="rounded-full border border-brand/25 px-4 py-2 text-brand transition hover:bg-white"
                  >
                    تماس با ما
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

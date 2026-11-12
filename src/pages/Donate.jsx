import { useSearchParams } from 'react-router-dom'
import { BadgeCheck, CreditCard, HeartHandshake, Info, ShieldCheck } from 'lucide-react'
import { api } from '../lib/api.js'
import { useResource } from '../lib/useResource.js'
import { useSite } from '../lib/site.jsx'
import { DonateForm } from '../components/forms.jsx'
import { Notice, PageHero, SectionHead } from '../components/ui.jsx'
import { Breadcrumbs, PrivacyNote } from '../components/blocks.jsx'

export default function Donate() {
  const [params] = useSearchParams()
  const { data: projects } = useResource(() => api('/projects'), [])
  const site = useSite()
  const online = Boolean(site.payment?.online)

  return (
    <>
      <PageHero
        eyebrow="حمایت مالی"
        title="سهم تو در ساختن آینده‌ای بهتر"
        text="با هر میزان کمک، می‌توانی در مسیر آموزش، سلامت و توانمندسازی زنان و کودکان بلوچ همراه ما باشی."
      />

      <section className="py-12 sm:py-16">
        <div className="container-x">
          <Breadcrumbs items={[{ label: 'حمایت مالی' }]} />

          <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <DonateForm projects={projects || []} initialSlug={params.get('project') || ''} />

            <aside className="space-y-4">
              {online ? (
                <Notice tone="success">
                  درگاه پرداخت آنلاین فعال است. پس از تکمیل فرم به صفحه بانک منتقل می‌شوید و وضعیت
                  کمک فقط پس از تأیید درگاه ثبت می‌شود.
                </Notice>
              ) : (
                <Notice tone="warning">
                  <p className="font-medium">درگاه پرداخت آنلاین هنوز متصل نشده است.</p>
                  <p>
                    فرم را تکمیل کنید تا درخواست شما با کد پیگیری ثبت شود؛ همکاران ما برای هماهنگی
                    روش پرداخت با شما تماس می‌گیرند. هیچ پرداختی بدون تأیید واقعی «موفق» ثبت
                    نمی‌شود.
                  </p>
                </Notice>
              )}

              <div className="rounded-[26px] border border-line bg-white p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-[16px] text-ink">چرا کمک شما امن است؟</h2>
                <ul className="mt-3 space-y-3 text-[12.5px] leading-7 text-muted">
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                    مشخصات اهداکنندگان محرمانه نگهداری می‌شود و در صفحات عمومی نمایش داده نمی‌شود.
                  </li>
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                    هر کمک با کد پیگیری یکتا ثبت و در گزارش‌های مالی تجمیع می‌شود.
                  </li>
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                    کمک‌های تأییدنشده به‌عنوان درآمد مجموعه ثبت نمی‌شوند.
                  </li>
                </ul>
              </div>

              <div className="rounded-[26px] border border-line bg-cream/60 p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-accent-dark">
                  <CreditCard className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-[16px] text-ink">روش‌های کمک</h2>
                <p className="mt-2 text-[12.5px] leading-7 text-muted">
                  پرداخت آنلاین از طریق درگاه بانکی، یا هماهنگی واریز مستقیم با همکاران مجموعه. برای
                  کمک‌های سازمانی و گزارش رسمی با ما تماس بگیرید.
                </p>
                <p className="mt-3 flex items-start gap-2 text-[11.5px] leading-6 text-muted">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  مبالغ به تومان محاسبه می‌شود. حداقل مبلغ کمک ۱۰٬۰۰۰ تومان است.
                </p>
              </div>

              <div className="rounded-[26px] bg-brand p-6 text-cream">
                <HeartHandshake className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-3 text-[16px]">کمک ماهانه</h2>
                <p className="mt-2 text-[12px] leading-7 text-cream/70">
                  کمک‌های مستمر، برنامه‌ریزی پروژه‌ها را ممکن می‌کند. اگر می‌خواهید به‌صورت ماهانه
                  همراه باشید، در توضیحات فرم بنویسید تا با شما هماهنگ کنیم.
                </p>
              </div>
            </aside>
          </div>

          <div className="mt-14 rounded-[26px] border border-line bg-white p-6 sm:p-8">
            <SectionHead
              eyebrow="شفافیت"
              title="کمک شما کجا هزینه می‌شود؟"
              text="منابع هر پروژه در گزارش عملکرد منتشر می‌شود و هزینه‌کرد آن با مستندات قابل مشاهده است."
            />
            <PrivacyNote />
          </div>
        </div>
      </section>
    </>
  )
}

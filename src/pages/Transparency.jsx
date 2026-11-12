import { BarChart3, CalendarClock, Download, FileText, HeartHandshake, Users } from 'lucide-react'
import { api } from '../lib/api.js'
import { useResource } from '../lib/useResource.js'
import { Button, Empty, Notice, PageHero, SectionHead } from '../components/ui.jsx'
import { Breadcrumbs, CtaBand } from '../components/blocks.jsx'
import { compactMoney, formatDate, money, num } from '../lib/format.js'
import { ImpactCard } from '../components/cards.jsx'

export default function Transparency() {
  const { data, loading, error } = useResource(() => api('/transparency'), [])
  const impact = data?.impact
  const reports = data?.reports || []
  const hasTotal = impact && Number(impact.total_received) > 0

  return (
    <>
      <PageHero
        eyebrow="گزارش عملکرد"
        title="شفافیت و گزارش عملکرد"
        text="اعداد این صفحه از پایگاه داده مجموعه خوانده می‌شود. اگر اطلاعاتی ثبت نشده باشد، به‌جای آمار ساختگی «اطلاعات در حال به‌روزرسانی است» نمایش داده می‌شود."
      />

      <section className="py-12 sm:py-16">
        <div className="container-x">
          <Breadcrumbs items={[{ label: 'گزارش عملکرد' }]} />

          {error && (
            <Notice tone="error" className="mb-6">
              {error}
            </Notice>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-36 animate-pulse rounded-[24px] bg-cream/70" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ImpactCard
                icon={HeartHandshake}
                value={hasTotal ? compactMoney(impact.total_received) : 'در حال به‌روزرسانی'}
                label="مجموع کمک‌های دریافت‌شده"
                hint={`${num(impact?.paid_donations || 0)} کمک تأییدشده`}
              />
              <ImpactCard
                icon={BarChart3}
                value={num(impact?.active_projects || 0)}
                label="پروژه‌های در حال اجرا"
                hint={`${num(impact?.completed_projects || 0)} پروژه تکمیل‌شده`}
              />
              <ImpactCard
                icon={Users}
                value={impact?.people_supported ? num(impact.people_supported) : 'در حال به‌روزرسانی'}
                label="افراد تحت حمایت"
                hint={impact?.people_supported ? null : 'آمار رسمی ثبت نشده است'}
              />
              <ImpactCard
                icon={CalendarClock}
                value={impact?.last_updated ? formatDate(impact.last_updated) : 'ثبت نشده'}
                label="آخرین به‌روزرسانی گزارش"
              />
            </div>
          )}

          <div className="mt-6 rounded-[24px] border border-line bg-white px-6 py-5 text-[12px] leading-7 text-muted">
            <p>
              مجموع کمک‌ها فقط شامل تراکنش‌هایی است که درگاه پرداخت آن‌ها را تأیید کرده است. درخواست‌های
              در انتظار پرداخت، در این آمار محاسبه نمی‌شوند.
            </p>
          </div>
        </div>
      </section>

      <section id="reports" className="bg-cream/50 py-14 sm:py-16">
        <div className="container-x">
          <SectionHead
            eyebrow="گزارش‌های مالی"
            title="گزارش‌ها و هزینه‌کرد کمک‌ها"
            text="گزارش‌های منتشرشده در این بخش، قابل مشاهده و دریافت به‌صورت PDF هستند."
          />

          <div className="mt-8">
            {loading ? (
              <div className="h-40 animate-pulse rounded-[24px] bg-white/70" />
            ) : reports.length === 0 ? (
              <Empty
                icon={FileText}
                title="اطلاعات در حال به‌روزرسانی است"
                text="هنوز گزارش مالی در سامانه ثبت نشده است. پس از تأیید و بارگذاری توسط مدیران مجموعه، در همین بخش منتشر می‌شود."
                action={
                  <Button to="/contact" variant="outline" size="sm">
                    پیگیری از طریق تماس
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {reports.map((report) => (
                  <li
                    key={report.id}
                    className="flex flex-col gap-4 rounded-[24px] border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand">
                        <FileText className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-[14px] font-medium text-ink">{report.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11.5px] text-muted">
                          {report.period && <span>دوره: {report.period}</span>}
                          <span>انتشار: {formatDate(report.published_at)}</span>
                          {report.amount_spent !== null && (
                            <span>هزینه‌کرد: {money(report.amount_spent)}</span>
                          )}
                        </div>
                        {report.summary && (
                          <p className="mt-2 max-w-2xl text-[12px] leading-6 text-muted">{report.summary}</p>
                        )}
                      </div>
                    </div>
                    {report.file_url ? (
                      <a
                        href={report.file_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand/25 px-4 py-2 text-[12px] text-brand transition hover:bg-brand-50"
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        دریافت PDF
                      </a>
                    ) : (
                      <span className="shrink-0 rounded-full bg-cream px-4 py-2 text-[11.5px] text-muted">
                        فایل در حال بارگذاری
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-6 text-[11.5px] leading-7 text-muted">
            برای اعتراض یا پرسش درباره گزارش‌های مالی، از طریق صفحه تماس با ما پیام بدهید. پاسخ‌گویی
            به گزارش‌ها بخشی از تعهد شفافیت مجموعه است.
          </p>
        </div>
      </section>

      <CtaBand
        eyebrow="همراهی"
        title="شفافیت با مشارکت شما کامل می‌شود"
        text="هر کمک، در گزارش بعدی مجموعه قابل پیگیری است."
      />
    </>
  )
}

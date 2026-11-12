import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, MapPin, ShieldCheck, Target } from 'lucide-react'
import { api } from '../lib/api.js'
import { useResource } from '../lib/useResource.js'
import { Artwork } from '../components/Art.jsx'
import { Badge, Button, Empty, Progress } from '../components/ui.jsx'
import { Breadcrumbs, CtaBand, PrivacyNote } from '../components/blocks.jsx'
import { ProjectCard } from '../components/cards.jsx'
import { formatDate, money, num, paragraphs, progressPercent } from '../lib/format.js'

const STATUS_LABELS = {
  active: 'در حال اجرا',
  completed: 'تکمیل‌شده',
  planned: 'در برنامه‌ریزی',
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const { data: project, loading, error } = useResource(() => api(`/projects/${slug}`), [slug])
  const { data: allProjects } = useResource(() => api('/projects'), [])

  if (loading) {
    return (
      <div className="container-x py-20">
        <div className="h-8 w-56 animate-pulse rounded-full bg-cream" />
        <div className="mt-6 h-80 animate-pulse rounded-[28px] bg-cream/70" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container-x py-20">
        <Empty
          title="این پروژه پیدا نشد"
          text={error || 'ممکن است نشانی پروژه تغییر کرده باشد.'}
          action={
            <Button to="/projects" variant="outline" size="sm">
              فهرست پروژه‌ها
            </Button>
          }
        />
      </div>
    )
  }

  const percent = progressPercent(project.raised_amount, project.target_amount)
  const related = (allProjects || []).filter((item) => item.slug !== project.slug).slice(0, 3)

  return (
    <>
      <section className="border-b border-line bg-cream/40">
        <div className="container-x py-10 sm:py-14">
          <Breadcrumbs items={[{ label: 'پروژه‌ها', to: '/projects' }, { label: project.title }]} />
          <div className="grid items-center gap-9 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Badge tone="accent">{STATUS_LABELS[project.status] || 'در حال اجرا'}</Badge>
              <h1 className="mt-4 text-[27px] leading-[1.45] text-ink sm:text-[34px]">{project.title}</h1>
              <p className="mt-4 text-[14px] leading-8 text-muted">{project.summary}</p>
              <div className="mt-5 flex flex-wrap items-center gap-5 text-[11.5px] text-muted">
                {project.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {project.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  شروع: {formatDate(project.created_at)}
                </span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button to={`/donate?project=${encodeURIComponent(project.slug)}`} size="lg">
                  حمایت از این پروژه
                </Button>
                <Button to="/projects" variant="outline" size="lg">
                  سایر پروژه‌ها
                </Button>
              </div>
            </div>
            <Artwork variant="project" src={project.image_url} alt={project.title} ratio="aspect-[16/11]" className="shadow-soft" />
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-x grid gap-10 lg:grid-cols-[1.6fr_0.9fr]">
          <div>
            <h2 className="text-[22px] text-ink">درباره این پروژه</h2>
            <div className="mt-4 space-y-4 text-[14px] leading-8 text-muted">
              {paragraphs(project.description || project.summary).map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <h3 className="mt-9 text-[17px] text-ink">هدف پروژه</h3>
            <div className="mt-3 flex items-start gap-3 rounded-2xl border border-line bg-white px-5 py-4">
              <Target className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <p className="text-[13px] leading-7 text-muted">
                {project.target_amount
                  ? `تأمین منابع لازم برای اجرای این پروژه با هدف مالی ${money(project.target_amount)}.`
                  : 'هدف مالی این پروژه در حال نهایی‌سازی است و پس از تأیید مجموعه منتشر می‌شود.'}
              </p>
            </div>

            <PrivacyNote>
              اطلاعات خانواده‌های تحت حمایت و جزئیات هویتی افراد در این صفحه منتشر نمی‌شود. گزارش
              مالی پروژه در بخش شفافیت به‌روزرسانی می‌گردد.
            </PrivacyNote>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-line bg-white p-6">
              <h3 className="text-[15px] text-ink">وضعیت مالی</h3>
              {percent === null ? (
                <p className="mt-3 rounded-2xl bg-cream/70 px-4 py-3 text-[12px] leading-7 text-muted">
                  اطلاعات در حال به‌روزرسانی است.
                </p>
              ) : (
                <div className="mt-4">
                  <div className="flex items-end justify-between">
                    <span className="text-[22px] font-semibold text-ink">{num(percent)}٪</span>
                    <span className="text-[11.5px] text-muted">{money(project.raised_amount)}</span>
                  </div>
                  <Progress value={percent} className="mt-3" />
                  <dl className="mt-4 space-y-2 text-[12px]">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted">جمع‌آوری‌شده</dt>
                      <dd className="font-medium text-ink">{money(project.raised_amount)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted">مبلغ موردنیاز</dt>
                      <dd className="font-medium text-ink">{money(project.target_amount)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted">تعداد کمک‌ها</dt>
                      <dd className="font-medium text-ink">{num(project.donors_count)}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>

            <div className="rounded-[24px] bg-brand p-6 text-cream">
              <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
              <h3 className="mt-3 text-[15px]">پرداخت امن</h3>
              <p className="mt-2 text-[12px] leading-7 text-cream/70">
                وضعیت کمک فقط پس از تأیید درگاه پرداخت ثبت می‌شود و در گزارش مالی نمایش داده
                می‌شود.
              </p>
              <Button to={`/donate?project=${encodeURIComponent(project.slug)}`} variant="light" size="sm" className="mt-4">
                حمایت مالی
              </Button>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-cream/50 py-14">
          <div className="container-x">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] text-ink">پروژه‌های دیگر</h2>
              <Link to="/projects" className="inline-flex items-center gap-1 text-[12px] text-brand">
                همه پروژه‌ها
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <ProjectCard key={item.slug} project={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand
        title="آماده همراهی با این پروژه هستید؟"
        text="هر مبلغی که در توان دارید، بخشی از مسیر این پروژه را پیش می‌برد."
        primary={{ label: 'حمایت از این پروژه', to: `/donate?project=${encodeURIComponent(project.slug)}` }}
      />
    </>
  )
}

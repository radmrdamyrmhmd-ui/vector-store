import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, HeartHandshake, ShoppingBasket, Sparkles } from 'lucide-react'
import { api } from '../lib/api.js'
import { useResource } from '../lib/useResource.js'
import { Artwork } from '../components/Art.jsx'
import { Button, Empty, Notice, SectionHead } from '../components/ui.jsx'
import { Breadcrumbs, CtaBand, PrivacyNote } from '../components/blocks.jsx'
import { paragraphs } from '../lib/format.js'

const ICONS = {
  book: BookOpen,
  sparkles: Sparkles,
  basket: ShoppingBasket,
  heart: HeartHandshake,
}

export default function ActivityDetail() {
  const { slug } = useParams()
  const { data, loading, error } = useResource(() => api('/activities'), [])
  const activities = data || []
  const activity = activities.find((item) => item.slug === slug)
  const others = activities.filter((item) => item.slug !== slug).slice(0, 3)

  if (loading) {
    return (
      <div className="container-x py-20">
        <div className="h-8 w-52 animate-pulse rounded-full bg-cream" />
        <div className="mt-6 h-64 animate-pulse rounded-[28px] bg-cream/70" />
      </div>
    )
  }

  if (error || !activity) {
    return (
      <div className="container-x py-20">
        <Empty
          title="این حوزه فعالیت پیدا نشد"
          text="ممکن است نشانی تغییر کرده باشد. فهرست حوزه‌های فعالیت را ببینید."
          action={
            <Button to="/activities" variant="outline" size="sm">
              بازگشت به حوزه‌های فعالیت
            </Button>
          }
        />
        {error && <Notice tone="error" className="mt-4">{error}</Notice>}
      </div>
    )
  }

  const Icon = ICONS[activity.icon] || HeartHandshake

  return (
    <>
      <section className="border-b border-line bg-cream/50">
        <div className="container-x py-10 sm:py-14">
          <Breadcrumbs items={[{ label: 'فعالیت‌های ما', to: '/activities' }, { label: activity.title }]} />
          <div className="grid items-center gap-9 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <span className="eyebrow">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                حوزه فعالیت
              </span>
              <h1 className="mt-4 text-[28px] leading-[1.45] text-ink sm:text-[36px]">{activity.title}</h1>
              <p className="mt-4 text-[14px] leading-8 text-muted">{activity.summary}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button to="/donate" size="md">
                  حمایت از این حوزه
                </Button>
                <Button to="/projects" variant="outline">
                  پروژه‌های مرتبط
                </Button>
              </div>
            </div>
            <Artwork
              variant="education"
              src={activity.image_url}
              alt={activity.title}
              ratio="aspect-[16/10]"
              className="shadow-soft"
            />
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-x grid gap-10 lg:grid-cols-[1.6fr_0.9fr]">
          <div>
            <h2 className="text-[22px] text-ink">درباره این حوزه</h2>
            <div className="mt-4 space-y-4 text-[14px] leading-8 text-muted">
              {paragraphs(activity.body || activity.summary).map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <PrivacyNote />
          </div>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-line bg-white p-6">
              <h3 className="text-[15px] text-ink">چه چیزی تأمین می‌شود؟</h3>
              <ul className="mt-3 space-y-2.5 text-[12.5px] leading-7 text-muted">
                <li>· منابع آموزشی و لوازم تحصیلی</li>
                <li>· دوره‌های مهارت‌آموزی و همراهی شغلی</li>
                <li>· بسته‌های معیشتی و بهداشتی هدفمند</li>
                <li>· پیگیری مستمر وضعیت خانواده‌ها</li>
              </ul>
            </div>
            <div className="rounded-[24px] bg-brand p-6 text-cream">
              <h3 className="text-[15px]">شفافیت در هزینه‌کرد</h3>
              <p className="mt-2 text-[12px] leading-7 text-cream/70">
                هزینه‌کرد هر حوزه در گزارش‌های مالی مجموعه منتشر می‌شود.
              </p>
              <Button to="/transparency" variant="darkOutline" size="sm" className="mt-4">
                مشاهده گزارش‌ها
              </Button>
            </div>
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className="bg-cream/50 py-14">
          <div className="container-x">
            <SectionHead eyebrow="ادامه مسیر" title="سایر حوزه‌های فعالیت" />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {others.map((item) => {
                const OtherIcon = ICONS[item.icon] || HeartHandshake
                return (
                  <Link
                    key={item.slug}
                    to={`/activities/${item.slug}`}
                    className="group block rounded-[22px] border border-line bg-white p-5 transition hover:-translate-y-1 hover:shadow-soft"
                  >
                    <OtherIcon className="h-5 w-5 text-brand" aria-hidden="true" />
                    <p className="mt-3 text-[14px] font-medium text-ink">{item.title}</p>
                    <p className="mt-1.5 line-clamp-2 text-[12px] leading-6 text-muted">{item.summary}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11.5px] text-brand">
                      جزئیات
                      <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  )
}

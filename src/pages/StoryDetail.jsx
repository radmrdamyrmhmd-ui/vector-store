import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, UserRound } from 'lucide-react'
import { api } from '../lib/api.js'
import { useResource } from '../lib/useResource.js'
import { Artwork } from '../components/Art.jsx'
import { Button, Empty, Notice } from '../components/ui.jsx'
import { Breadcrumbs, CtaBand, PrivacyNote } from '../components/blocks.jsx'
import { StoryCard } from '../components/cards.jsx'
import { formatDate, paragraphs } from '../lib/format.js'

export default function StoryDetail() {
  const { slug } = useParams()
  const { data: story, loading, error } = useResource(() => api(`/stories/${slug}`), [slug])
  const { data: allStories } = useResource(() => api('/stories'), [])

  if (loading) {
    return (
      <div className="container-x py-20">
        <div className="h-8 w-64 animate-pulse rounded-full bg-cream" />
        <div className="mt-6 h-72 animate-pulse rounded-[28px] bg-cream/70" />
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="container-x py-20">
        <Empty
          title="این داستان پیدا نشد"
          text={error || 'ممکن است نشانی داستان تغییر کرده باشد.'}
          action={
            <Button to="/stories" variant="outline" size="sm">
              بازگشت به داستان‌ها
            </Button>
          }
        />
        {error && <Notice tone="error" className="mt-4">{error}</Notice>}
      </div>
    )
  }

  const related = (allStories || []).filter((item) => item.slug !== story.slug).slice(0, 3)

  return (
    <>
      <section className="border-b border-line bg-cream/40 py-10 sm:py-14">
        <div className="container-x max-w-3xl">
          <Breadcrumbs items={[{ label: 'داستان‌ها', to: '/stories' }, { label: story.title }]} />
          <h1 className="text-[27px] leading-[1.45] text-ink sm:text-[34px]">{story.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[11.5px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(story.published_at)}
            </span>
            {story.author && (
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                {story.author}
              </span>
            )}
          </div>
        </div>
      </section>

      <article className="py-12">
        <div className="container-x grid gap-10 lg:grid-cols-[1.5fr_0.8fr]">
          <div>
            <Artwork
              variant="story"
              src={story.image_url}
              alt={story.title}
              ratio="aspect-[16/9]"
              className="shadow-soft"
            />
            <div className="mt-8 space-y-4 text-[14.5px] leading-9 text-ink/75">
              {paragraphs(story.body || story.excerpt).map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <PrivacyNote>
              این روایت با رضایت آگاهانه افراد منتشر شده است. اطلاعات هویتی کودکان و جزئیات
              شناسایی‌پذیر خانواده‌ها در این متن منتشر نمی‌شود.
            </PrivacyNote>
            <Link to="/stories" className="mt-7 inline-flex items-center gap-1.5 text-[12.5px] text-brand">
              بازگشت به همه داستان‌ها
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-line bg-white p-6">
              <h2 className="text-[15px] text-ink">درباره این روایت</h2>
              <p className="mt-2 text-[12px] leading-7 text-muted">
                داستان‌های مجموعه بر پایه گزارش‌های واقعی فعالیت‌ها و با حفظ کرامت افراد نوشته
                می‌شوند.
              </p>
              <Button to="/donate" size="sm" className="mt-4">
                حمایت مالی
              </Button>
            </div>
            <div className="rounded-[24px] bg-brand p-6 text-cream">
              <h2 className="text-[15px]">داوطلب شوید</h2>
              <p className="mt-2 text-[12px] leading-7 text-cream/70">
                اگر می‌توانید در تولید محتوا، آموزش یا پشتیبانی اجرایی همراه باشید، درخواست خود را
                ثبت کنید.
              </p>
              <Button to="/volunteer" variant="darkOutline" size="sm" className="mt-4">
                ثبت درخواست
              </Button>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-cream/50 py-14">
          <div className="container-x">
            <h2 className="text-[20px] text-ink">داستان‌های دیگر</h2>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <StoryCard key={item.slug} story={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  )
}

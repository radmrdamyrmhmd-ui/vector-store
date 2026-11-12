import { BookOpen } from 'lucide-react'
import { api } from '../lib/api.js'
import { useResource } from '../lib/useResource.js'
import { Button, Empty, Notice, PageHero } from '../components/ui.jsx'
import { Breadcrumbs, CtaBand, PrivacyNote } from '../components/blocks.jsx'
import { StoryCard } from '../components/cards.jsx'
import Reveal from '../components/Reveal.jsx'

export default function Stories() {
  const { data, loading, error } = useResource(() => api('/stories'), [])
  const stories = data || []

  return (
    <>
      <PageHero
        eyebrow="داستان‌ها و اخبار"
        title="داستان‌هایی از امید و تغییر"
        text="گزارش فعالیت‌ها، روایت پروژه‌ها و تجربه داوطلبان. همه روایت‌ها با رضایت آگاهانه افراد و بدون نمایش اغراق‌آمیز رنج منتشر می‌شوند."
      />

      <section className="py-12 sm:py-16">
        <div className="container-x">
          <Breadcrumbs items={[{ label: 'داستان‌ها' }]} />

          {error && (
            <Notice tone="error" className="mb-6">
              {error}
            </Notice>
          )}

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-80 animate-pulse rounded-[26px] bg-cream/70" />
              ))}
            </div>
          ) : stories.length === 0 ? (
            <Empty
              icon={BookOpen}
              title="به‌زودی روایت‌های امید اینجا منتشر می‌شود"
              text="نخستین داستان‌ها پس از تأیید مستندات و رضایت افراد منتشر خواهد شد. تا آن زمان می‌توانید گزارش عملکرد مجموعه را ببینید."
              action={
                <Button to="/transparency" variant="outline" size="sm">
                  گزارش عملکرد
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {stories.map((story, index) => (
                <Reveal key={story.slug} delay={(index % 3) * 60}>
                  <StoryCard story={story} />
                </Reveal>
              ))}
            </div>
          )}

          <PrivacyNote />
        </div>
      </section>

      <CtaBand
        eyebrow="همراهی"
        title="تو هم می‌توانی بخشی از این تغییر باشی"
        text="برای ساختن آینده‌ای بهتر، به همراهی انسان‌هایی نیاز داریم که به تغییر باور دارند."
      />
    </>
  )
}

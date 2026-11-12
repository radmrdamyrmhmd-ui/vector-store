import { useMemo, useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { api } from '../lib/api.js'
import { useResource } from '../lib/useResource.js'
import { Empty, Notice, PageHero } from '../components/ui.jsx'
import { Breadcrumbs, CtaBand } from '../components/blocks.jsx'
import { ProjectCard } from '../components/cards.jsx'
import Reveal from '../components/Reveal.jsx'

const FILTERS = [
  { key: 'all', label: 'همه پروژه‌ها' },
  { key: 'active', label: 'در حال اجرا' },
  { key: 'completed', label: 'تکمیل‌شده' },
]

export default function Projects() {
  const { data, loading, error } = useResource(() => api('/projects'), [])
  const [filter, setFilter] = useState('all')
  const projects = data || []

  const visible = useMemo(
    () => (filter === 'all' ? projects : projects.filter((project) => project.status === filter)),
    [projects, filter]
  )

  return (
    <>
      <PageHero
        eyebrow="پروژه‌های حمایتی"
        title="پروژه‌هایی که با هم پیش می‌بریم"
        text="هر پروژه هدف، محدوده و گزارش مالی مشخص دارد. مبالغ جمع‌آوری‌شده فقط از کمک‌های تأییدشده محاسبه می‌شود و تا زمان ثبت هدف مالی، عدد تخمینی نمایش داده نمی‌شود."
      />

      <section className="py-12 sm:py-16">
        <div className="container-x">
          <Breadcrumbs items={[{ label: 'پروژه‌های حمایتی' }]} />

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                aria-pressed={filter === item.key}
                className={`rounded-full px-4 py-2 text-[12.5px] transition ${
                  filter === item.key
                    ? 'bg-brand text-cream'
                    : 'border border-line bg-white text-ink/70 hover:border-brand/30 hover:text-brand'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {error && (
            <Notice tone="error" className="mt-6">
              {error}
            </Notice>
          )}

          {loading ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-80 animate-pulse rounded-[26px] bg-cream/70" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="mt-8">
              <Empty
                icon={FolderOpen}
                title="پروژه‌ای در این دسته وجود ندارد"
                text="با تغییر فیلتر، پروژه‌های دیگر را ببینید یا برای اطلاع از پروژه‌های جدید عضو خبرنامه شوید."
              />
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((project, index) => (
                <Reveal key={project.slug} delay={(index % 3) * 60}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  )
}

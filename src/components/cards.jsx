import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  HeartHandshake,
  MapPin,
  ShoppingBasket,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { Artwork } from './Art.jsx'
import { Badge, Progress } from './ui.jsx'
import { formatDate, money, num, progressPercent } from '../lib/format.js'

const ACTIVITY_ICONS = {
  book: BookOpen,
  sparkles: Sparkles,
  basket: ShoppingBasket,
  heart: HeartHandshake,
}

const STATUS_LABELS = {
  active: 'در حال اجرا',
  completed: 'تکمیل‌شده',
  planned: 'در برنامه‌ریزی',
}

export function ActivityCard({ activity, index = 0 }) {
  const Icon = ACTIVITY_ICONS[activity.icon] || HeartHandshake
  return (
    <Link
      to={`/activities/${activity.slug}`}
      className="group flex h-full flex-col rounded-[26px] border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-soft"
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand transition group-hover:bg-brand group-hover:text-cream">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-[17px] text-ink">{activity.title}</h3>
      <p className="mt-2.5 flex-1 text-[13px] leading-7 text-muted">{activity.summary}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand">
        مشاهده جزئیات
        <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  )
}

export function ProjectCard({ project }) {
  const percent = progressPercent(project.raised_amount, project.target_amount)
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/projects/${project.slug}`} aria-label={project.title} className="block">
        <Artwork
          variant="project"
          src={project.image_url}
          alt={project.title}
          ratio="aspect-[16/10]"
          rounded="rounded-none"
        />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <Badge tone="brand">{STATUS_LABELS[project.status] || 'در حال اجرا'}</Badge>
          {project.location && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {project.location}
            </span>
          )}
        </div>
        <h3 className="mt-4 text-[17px] leading-8 text-ink">
          <Link to={`/projects/${project.slug}`} className="transition hover:text-brand">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-7 text-muted">{project.summary}</p>

        <div className="mt-5">
          {percent === null ? (
            <p className="rounded-2xl bg-cream/70 px-4 py-3 text-[11.5px] text-muted">
              اطلاعات مالی این پروژه در حال به‌روزرسانی است.
            </p>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between text-[11.5px] text-muted">
                <span>جمع‌آوری‌شده: {money(project.raised_amount)}</span>
                <span>{num(percent)}٪</span>
              </div>
              <Progress value={percent} />
              <p className="mt-2 text-[11.5px] text-muted">هدف: {money(project.target_amount)}</p>
            </>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <Link
            to={`/donate?project=${encodeURIComponent(project.slug)}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[12.5px] font-medium text-white transition hover:bg-accent-dark"
          >
            حمایت از این پروژه
          </Link>
          <Link
            to={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1 text-[12.5px] text-brand transition hover:text-brand-dark"
          >
            جزئیات
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export function StoryCard({ story }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link to={`/stories/${story.slug}`} aria-label={story.title} className="block">
        <Artwork
          variant="story"
          src={story.image_url}
          alt={story.title}
          ratio="aspect-[16/10]"
          rounded="rounded-none"
        />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDate(story.published_at)}
        </span>
        <h3 className="mt-3 text-[17px] leading-8 text-ink">
          <Link to={`/stories/${story.slug}`} className="transition hover:text-brand">
            {story.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-7 text-muted">{story.excerpt}</p>
        <Link
          to={`/stories/${story.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand"
        >
          ادامه مطلب
          <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

export function ImpactCard({ icon: Icon = Users, value, label, hint }) {
  return (
    <div className="rounded-[24px] border border-line bg-white px-5 py-6 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent-dark">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-[22px] font-semibold text-ink sm:text-[26px]">{value}</p>
      <p className="mt-1 text-[12px] text-muted">{label}</p>
      {hint && <p className="mt-2 text-[10.5px] text-muted/80">{hint}</p>}
    </div>
  )
}

export function ProjectMeta({ project }) {
  const percent = progressPercent(project.raised_amount, project.target_amount)
  return (
    <div className="rounded-[24px] border border-line bg-white p-6">
      <div className="flex items-center gap-2 text-[12px] text-muted">
        <Target className="h-4 w-4 text-brand" aria-hidden="true" />
        وضعیت مالی پروژه
      </div>
      {percent === null ? (
        <p className="mt-3 rounded-2xl bg-cream/70 px-4 py-3 text-[12px] leading-7 text-muted">
          هدف مالی این پروژه هنوز ثبت نشده است. اطلاعات مالی پس از تأیید مجموعه در همین صفحه منتشر
          می‌شود.
        </p>
      ) : (
        <div className="mt-4">
          <div className="flex items-end justify-between">
            <span className="text-[20px] font-semibold text-ink">{num(percent)}٪</span>
            <span className="text-[11.5px] text-muted">{money(project.raised_amount)}</span>
          </div>
          <Progress value={percent} className="mt-3" />
          <div className="mt-3 flex items-center justify-between text-[11.5px] text-muted">
            <span>هدف: {money(project.target_amount)}</span>
            <span>{num(project.donors_count)} کمک ثبت‌شده</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function SectionDivider() {
  return <div className="container-x"><div className="hairline" /></div>
}

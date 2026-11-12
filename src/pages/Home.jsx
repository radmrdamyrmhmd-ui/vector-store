import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  HeartHandshake,
  Quote,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useSettings, useSite } from '../lib/site.jsx'
import { Artwork } from '../components/Art.jsx'
import { Badge, Button, Empty, SectionHead } from '../components/ui.jsx'
import { ActivityCard, ImpactCard, ProjectCard, StoryCard } from '../components/cards.jsx'
import { NewsletterForm } from '../components/forms.jsx'
import Reveal from '../components/Reveal.jsx'
import { compactMoney, formatDate, num, paragraphs } from '../lib/format.js'

function Hero() {
  const settings = useSettings()
  const { impact } = useSite()
  const hasTotal = impact && Number(impact.total_received) > 0

  return (
    <section className="relative overflow-hidden border-b border-line/70">
      <div className="absolute inset-0 bg-gradient-to-bl from-cream/80 via-canvas to-canvas" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />

      <div className="container-x relative py-10 sm:py-14 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <div className="relative">
            <span className="eyebrow-accent">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {settings.site_subtitle || 'بنیاد خیریه حمایت از زنان و کودکان بلوچ'}
            </span>
            <h1 className="mt-5 text-[32px] leading-[1.4] text-ink sm:text-[42px] lg:text-[50px] lg:leading-[1.3]">
              {settings.hero_title || 'با هم، آینده‌ای روشن‌تر می‌سازیم'}
            </h1>
            <p className="mt-5 max-w-xl text-[14.5px] leading-9 text-muted sm:text-[15.5px]">
              {settings.hero_text}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button to="/donate" size="lg">
                <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                همین حالا حمایت کن
              </Button>
              <Button to="/activities" variant="outline" size="lg">
                با فعالیت‌های ما آشنا شو
              </Button>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-line bg-white/70 px-5 py-4 sm:max-w-md">
              <Quote className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <p className="text-[12.5px] leading-7 text-ink/80">
                {settings.hero_note || 'هر قدم کوچک، می‌تواند آغاز یک تغییر بزرگ باشد.'}
              </p>
            </div>
          </div>

          <div className="relative">
            <Artwork
              variant="hero"
              src={settings.hero_image}
              alt="فضای آموزش و همراهی با کودکان بلوچ"
              ratio="aspect-[5/4]"
              className="shadow-lift"
            />
            <div className="absolute -bottom-6 right-4 left-4 hidden rounded-2xl border border-line bg-white/95 px-5 py-4 shadow-soft backdrop-blur sm:block sm:left-auto sm:right-6 sm:w-60">
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                {hasTotal ? 'کمک‌های ثبت‌شده تا امروز' : 'شفافیت در منابع و هزینه‌ها'}
              </div>
              <p className="mt-1.5 text-[17px] font-semibold text-ink">
                {hasTotal ? compactMoney(impact.total_received) : 'گزارش‌های مالی در دسترس'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AboutTeaser() {
  const settings = useSettings()
  const points = [
    'کرامت انسانی در تمام تصمیم‌ها',
    'شفافیت در منابع و هزینه‌ها',
    'همراهی با جامعه محلی، نه جای آن',
  ]

  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative">
              <Artwork
                variant="about"
                src={settings.about_image}
                alt="فعالیت‌های اجتماعی همراهان امید"
                ratio="aspect-[4/3]"
                className="shadow-soft"
              />
              <div className="absolute -bottom-8 left-4 hidden w-40 overflow-hidden rounded-[22px] border-4 border-canvas shadow-soft sm:block lg:-left-8 lg:w-48">
                <Artwork variant="volunteer" ratio="aspect-square" rounded="rounded-none" alt="" />
              </div>
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <span className="eyebrow">درباره ما</span>
            <h2 className="mt-4 text-[26px] leading-[1.5] text-ink sm:text-[32px] lg:text-[36px]">
              {settings.about_title || 'ما برای ساختن امید کنار هم هستیم'}
            </h2>
            <div className="mt-4 space-y-4 text-[14px] leading-8 text-muted">
              {paragraphs(settings.about_text).map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <ul className="mt-6 space-y-3">
              {points.map((point) => (
                <li key={point} className="flex items-center gap-3 text-[13px] text-ink/80">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <Button to="/about" variant="outline" className="mt-7">
              بیشتر درباره ما بدانید
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function ActivitiesSection() {
  const { activities } = useSite()
  return (
    <section className="bg-cream/50 py-16 sm:py-20">
      <div className="container-x">
        <SectionHead
          eyebrow="حوزه‌های فعالیت"
          title="کجا و چگونه همراهی می‌کنیم؟"
          text="چهار مسیر اصلی فعالیت ما، از آموزش کودکان تا توانمندسازی زنان، در کنار هم یک زنجیره حمایتی می‌سازند."
          action={
            <Button to="/activities" variant="outline" size="sm">
              مشاهده همه حوزه‌ها
            </Button>
          }
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((activity, index) => (
            <Reveal key={activity.slug} delay={index * 60}>
              <ActivityCard activity={activity} index={index} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ImpactBand() {
  const { impact } = useSite()
  const items = [
    {
      icon: HeartHandshake,
      label: 'مجموع کمک‌های ثبت‌شده',
      value: impact && Number(impact.total_received) > 0 ? compactMoney(impact.total_received) : '—',
      pending: !impact || Number(impact.total_received) === 0,
    },
    {
      icon: BadgeCheck,
      label: 'پروژه‌های در حال اجرا',
      value: impact ? num(impact.active_projects) : '—',
      pending: !impact,
    },
    {
      icon: Users,
      label: 'افراد تحت حمایت',
      value: impact?.people_supported ? num(impact.people_supported) : '—',
      pending: !impact?.people_supported,
    },
    {
      icon: CalendarDays,
      label: 'آخرین به‌روزرسانی گزارش',
      value: impact?.last_updated ? formatDate(impact.last_updated) : '—',
      pending: !impact?.last_updated,
    },
  ]

  return (
    <section className="bg-brand-deep py-14 text-cream sm:py-16">
      <div className="container-x">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <span className="eyebrow-accent">شفافیت</span>
            <h2 className="mt-4 text-[24px] leading-[1.5] text-cream sm:text-[28px]">
              اعداد این بخش از پایگاه داده مجموعه خوانده می‌شود
            </h2>
            <p className="mt-3 text-[13px] leading-7 text-cream/65">
              هر رقمی که ثبت نشده باشد، به‌جای عدد تخمینی با «اطلاعات در حال به‌روزرسانی است»
              نمایش داده می‌شود.
            </p>
            <Link
              to="/transparency"
              className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-accent transition hover:text-cream"
            >
              مشاهده گزارش عملکرد
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-3 sm:gap-4 lg:max-w-2xl">
            {items.map(({ icon: Icon, label, value, pending }) => (
              <div key={label} className="rounded-2xl border border-cream/12 bg-white/[0.04] px-4 py-4">
                <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                <p className="mt-3 text-[19px] font-semibold text-cream sm:text-[22px]">{value}</p>
                <p className="mt-1 text-[11px] text-cream/55">{label}</p>
                {pending && <p className="mt-1 text-[10px] text-cream/35">در حال به‌روزرسانی است</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProjectsSection() {
  const { projects } = useSite()
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <SectionHead
          eyebrow="پروژه‌های حمایتی"
          title="پروژه‌هایی که با هم پیش می‌بریم"
          text="هر پروژه یک مسیر مشخص دارد؛ میزان پیشرفت مالی فقط از کمک‌های تأییدشده محاسبه می‌شود."
          action={
            <Button to="/projects" variant="outline" size="sm">
              همه پروژه‌ها
            </Button>
          }
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3">
              <Empty
                title="پروژه‌ها در حال به‌روزرسانی است"
                text="به‌زودی پروژه‌های جدید همراه با گزارش مالی در همین بخش منتشر می‌شود."
              />
            </div>
          ) : (
            projects.map((project, index) => (
              <Reveal key={project.slug} delay={index * 70}>
                <ProjectCard project={project} />
              </Reveal>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function DonateBand() {
  return (
    <section className="pb-4">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[32px] bg-brand px-6 py-12 text-cream sm:px-10 lg:px-14 lg:py-16">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-cream/10 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="eyebrow-accent">حمایت مالی</span>
              <h2 className="mt-4 text-[26px] leading-[1.5] text-cream sm:text-[32px]">
                سهم تو در ساختن آینده‌ای بهتر
              </h2>
              <p className="mt-4 text-[13.5px] leading-8 text-cream/70">
                با هر میزان کمک، می‌توانی در مسیر آموزش، سلامت و توانمندسازی زنان و کودکان بلوچ
                همراه ما باشی.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row lg:flex-col lg:items-end">
              <Button to="/donate" variant="light" size="lg">
                حمایت مالی
              </Button>
              <Button to="/volunteer" variant="darkOutline" size="lg">
                داوطلب شوید
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StoriesSection() {
  const { stories } = useSite()
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <SectionHead
          eyebrow="داستان‌ها"
          title="داستان‌هایی از امید و تغییر"
          text="روایت‌های مجموعه، گزارش فعالیت‌ها و تجربه داوطلبان — به‌زودی با مستندات و رضایت افراد منتشر می‌شود."
          action={
            <Button to="/stories" variant="outline" size="sm">
              همه داستان‌ها
            </Button>
          }
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {stories.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3">
              <Empty
                title="به‌زودی روایت‌های امید اینجا منتشر می‌شود"
                text="تا زمان انتشار نخستین داستان‌ها، می‌توانید گزارش عملکرد مجموعه را ببینید."
                action={
                  <Button to="/transparency" variant="outline" size="sm">
                    گزارش عملکرد
                  </Button>
                }
              />
            </div>
          ) : (
            stories.map((story, index) => (
              <Reveal key={story.slug} delay={index * 70}>
                <StoryCard story={story} />
              </Reveal>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function JoinBand() {
  return (
    <section className="pb-20">
      <div className="container-x">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] border border-line bg-cream/70 p-7 sm:p-9">
            <span className="eyebrow">همکاری</span>
            <h2 className="mt-4 text-[22px] leading-[1.55] text-ink sm:text-[26px]">
              تو هم می‌توانی بخشی از این تغییر باشی
            </h2>
            <p className="mt-3 text-[13px] leading-7 text-muted">
              برای ساختن آینده‌ای بهتر، به همراهی انسان‌هایی نیاز داریم که به تغییر باور دارند.
            </p>
            <Button to="/volunteer" variant="primary" className="mt-6">
              ثبت درخواست همکاری
            </Button>
          </div>
          <div className="rounded-[28px] bg-brand-dark p-7 text-cream sm:p-9">
            <h2 className="text-[22px] leading-[1.55] sm:text-[26px]">همراه ما بمان</h2>
            <p className="mt-3 text-[13px] leading-7 text-cream/70">
              از فعالیت‌ها، پروژه‌های جدید و گزارش‌های مجموعه باخبر شو.
            </p>
            <div className="mt-6">
              <NewsletterForm tone="light" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <AboutTeaser />
      <ActivitiesSection />
      <ImpactBand />
      <ProjectsSection />
      <DonateBand />
      <StoriesSection />
      <JoinBand />
    </>
  )
}

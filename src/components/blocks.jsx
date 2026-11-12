import { Link } from 'react-router-dom'
import { ChevronLeft, HeartHandshake, ShieldCheck } from 'lucide-react'
import { Button } from './ui.jsx'

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="مسیر صفحه" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted">
        <li>
          <Link to="/" className="transition hover:text-brand">
            خانه
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <ChevronLeft className="h-3 w-3 text-line" aria-hidden="true" />
            {item.to ? (
              <Link to={item.to} className="transition hover:text-brand">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink/70" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function CtaBand({
  eyebrow = 'حمایت مالی',
  title = 'سهم تو در ساختن آینده‌ای بهتر',
  text = 'با هر میزان کمک، می‌توانی در مسیر آموزش، سلامت و توانمندسازی زنان و کودکان بلوچ همراه ما باشی.',
  primary = { label: 'حمایت مالی', to: '/donate' },
  secondary = { label: 'همکاری و داوطلبی', to: '/volunteer' },
}) {
  return (
    <section className="pb-4 pt-8">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[30px] bg-brand px-6 py-11 text-cream sm:px-10 lg:px-14">
          <div className="pointer-events-none absolute -left-14 -top-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="eyebrow-accent">{eyebrow}</span>
              <h2 className="mt-4 text-[24px] leading-[1.5] text-cream sm:text-[30px]">{title}</h2>
              <p className="mt-3 text-[13px] leading-8 text-cream/70">{text}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <Button to={primary.to} variant="light" size="lg">
                <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                {primary.label}
              </Button>
              <Button to={secondary.to} variant="darkOutline" size="lg">
                {secondary.label}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function PrivacyNote({ children }) {
  return (
    <div className="mt-8 flex items-start gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-[11.5px] leading-7 text-muted">
      <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
      <p>
        {children ||
          'همراهان امید هیچ آمار، تصویر یا داستانی را بدون مستندات و رضایت آگاهانه منتشر نمی‌کند. تصاویر و روایت‌های منتشرشده با احترام به کرامت افراد انتخاب می‌شوند.'}
      </p>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { FlaskConical, Info } from 'lucide-react'
import { useSettings } from '../lib/site.jsx'

/**
 * Site-wide disclosure. This build is a portfolio demonstration, so every page
 * states that the organisation is not operating and the content is sample data.
 */
export function DemoRibbon() {
  const settings = useSettings()
  if (settings.demo_mode === false) return null
  return (
    <div className="border-b border-accent/20 bg-accent-soft/70">
      <div className="container-x flex items-center justify-center gap-2 py-1.5 text-center text-[11px] leading-6 text-accent-dark">
        <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="sm:hidden">نمونه‌کار نمایشی — مؤسسه فعال نیست</span>
        <span className="hidden sm:inline">
          {settings.demo_note ||
            'این وب‌سایت یک نمونه‌کار نمایشی است؛ مؤسسه فعال نیست و محتوای آن نمونه است.'}
        </span>
        <Link to="/terms" className="shrink-0 underline underline-offset-4 hover:text-brand">
          جزئیات
        </Link>
      </div>
    </div>
  )
}

/** Marks a seeded record so a sample item is never read as a real report. */
export function SampleTag({ label = 'داده نمونه', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-soft/60 px-2.5 py-[3px] text-[10.5px] font-medium text-accent-dark ${className}`}
    >
      <Info className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  )
}

/** Marks a payment that only ran as a demonstration. */
export function SimulatedTag({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-brand/25 bg-brand-50 px-2.5 py-[3px] text-[10.5px] font-medium text-brand ${className}`}
    >
      <FlaskConical className="h-3 w-3" aria-hidden="true" />
      پرداخت شبیه‌سازی‌شده
    </span>
  )
}

import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react'

const VARIANTS = {
  accent:
    'bg-accent text-white hover:bg-accent-dark shadow-[0_16px_34px_-22px_rgba(190,112,56,0.95)]',
  primary: 'bg-brand text-cream hover:bg-brand-dark',
  outline: 'border border-brand/25 bg-transparent text-brand hover:border-brand hover:bg-brand-50',
  ghost: 'text-brand hover:bg-brand-50',
  light: 'bg-white text-brand hover:bg-cream',
  darkOutline: 'border border-cream/30 bg-transparent text-cream hover:bg-white/10',
}

const SIZES = {
  sm: 'px-4 py-2 text-[13px]',
  md: 'px-6 py-3 text-[15px]',
  lg: 'px-7 py-3.5 text-[15px]',
}

export function Button({
  variant = 'accent',
  size = 'md',
  className,
  to,
  href,
  type = 'button',
  loading = false,
  children,
  ...rest
}) {
  const classes = clsx(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    className
  )
  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  )
  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    )
  }
  return (
    <button type={type} className={classes} disabled={loading || rest.disabled} {...rest}>
      {content}
    </button>
  )
}

export function SectionHead({
  eyebrow,
  title,
  text,
  action,
  tone = 'dark',
  align = 'start',
  className,
  as: Heading = 'h2',
}) {
  const light = tone === 'light'
  return (
    <div
      className={clsx(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'md:flex-col md:items-center md:text-center',
        className
      )}
    >
      <div className={clsx('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <span className={light ? 'eyebrow-accent' : 'eyebrow'}>
            <span className={clsx('h-1.5 w-1.5 rounded-full', light ? 'bg-accent' : 'bg-brand/60')} />
            {eyebrow}
          </span>
        )}
        <Heading
          className={clsx(
            'mt-4 text-[26px] leading-[1.5] sm:text-[32px] lg:text-[38px]',
            light ? 'text-cream' : 'text-ink'
          )}
        >
          {title}
        </Heading>
        {text && (
          <p className={clsx('mt-4 text-[15px] leading-8', light ? 'text-cream/75' : 'text-muted')}>
            {text}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function Field({ label, hint, error, required, htmlFor, children, className }) {
  return (
    <label htmlFor={htmlFor} className={clsx('block', className)}>
      {label && (
        <span className="mb-2 flex items-center gap-1 text-[13px] font-medium text-ink">
          {label}
          {required && <span className="text-accent">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1.5 block text-[12px] text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-[12px] text-muted">{hint}</span>
      )}
    </label>
  )
}

export function Input({ className, ...props }) {
  return <input className={clsx('field', className)} {...props} />
}

export function Textarea({ className, rows = 5, ...props }) {
  return <textarea rows={rows} className={clsx('field resize-y leading-7', className)} {...props} />
}

export function Select({ className, children, ...props }) {
  return (
    <select className={clsx('field appearance-none', className)} {...props}>
      {children}
    </select>
  )
}

const NOTICE_TONES = {
  info: {
    wrap: 'border-brand/20 bg-brand-50 text-brand-dark',
    Icon: Info,
  },
  success: {
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Icon: CheckCircle2,
  },
  warning: {
    wrap: 'border-amber-200 bg-amber-50 text-amber-900',
    Icon: AlertTriangle,
  },
  error: {
    wrap: 'border-red-200 bg-red-50 text-red-700',
    Icon: AlertTriangle,
  },
}

export function Notice({ tone = 'info', children, className }) {
  const { wrap, Icon } = NOTICE_TONES[tone] || NOTICE_TONES.info
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={clsx(
        'flex items-start gap-3 rounded-2xl border px-4 py-3 text-[13px] leading-7',
        wrap,
        className
      )}
    >
      <Icon className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="space-y-1">{children}</div>
    </div>
  )
}

export function Progress({ value, className }) {
  if (value === null || value === undefined) return null
  const width = Math.max(0, Math.min(100, Number(value)))
  return (
    <div
      className={clsx('h-2 w-full overflow-hidden rounded-full bg-cream', className)}
      role="progressbar"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-l from-brand to-brand-light transition-[width] duration-700"
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export function Badge({ children, tone = 'brand', className }) {
  const tones = {
    brand: 'bg-brand-50 text-brand',
    accent: 'bg-accent-soft text-accent-dark',
    muted: 'bg-cream text-muted',
  }
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

export function Empty({ title, text, action, icon: Icon }) {
  return (
    <div className="rounded-[26px] border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      {Icon && (
        <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-cream text-brand">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {text && <p className="mx-auto mt-2 max-w-md text-[13px] leading-7 text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function Spinner({ label = 'در حال بارگذاری…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-[13px] text-muted">
      <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden="true" />
      {label}
    </div>
  )
}

export function PageHero({ eyebrow, title, text, children }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-cream/60">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
      <div className="container-x relative py-14 sm:py-16 lg:py-20">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="mt-5 max-w-3xl text-[30px] leading-[1.45] text-ink sm:text-[38px] lg:text-[44px]">
          {title}
        </h1>
        {text && <p className="mt-4 max-w-2xl text-[15px] leading-8 text-muted">{text}</p>}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  )
}

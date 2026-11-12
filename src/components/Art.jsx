import clsx from 'clsx'
import { useId } from 'react'

// The charity has not supplied photography yet, so every visual slot falls back to
// an abstract, respectful composition instead of borrowed or fabricated photos.
// As soon as an image is uploaded in the admin panel it replaces the artwork.
const ART = {
  hero: { from: '#2C5346', to: '#17332B', line: '#F5F0E8', accent: '#D88A52', soft: '#3F7361' },
  about: { from: '#315C4C', to: '#22453A', line: '#F5F0E8', accent: '#E7C9A8', soft: '#3F7361' },
  education: { from: '#F2E9DB', to: '#E5D8C4', line: '#315C4C', accent: '#D88A52', soft: '#F8F2E8' },
  women: { from: '#2F5A4A', to: '#1E3F34', line: '#EFE7DA', accent: '#D88A52', soft: '#41735F' },
  livelihood: { from: '#F3E7D8', to: '#E8D6C0', line: '#8A5A33', accent: '#315C4C', soft: '#FAF4EA' },
  health: { from: '#EDF1EC', to: '#DBE5DD', line: '#315C4C', accent: '#D88A52', soft: '#F8FAF7' },
  story: { from: '#234A3D', to: '#17332B', line: '#EFE7DA', accent: '#D88A52', soft: '#376656' },
  project: { from: '#2C5346', to: '#1B3A30', line: '#EFE7DA', accent: '#E7C9A8', soft: '#3C6C59' },
  volunteer: { from: '#F5F0E8', to: '#E9E0D1', line: '#315C4C', accent: '#D88A52', soft: '#FBF7F0' },
}

export function Artwork({
  variant = 'hero',
  src,
  alt = '',
  className,
  ratio = 'aspect-[4/3]',
  rounded = 'rounded-[30px]',
  children,
}) {
  const rawId = useId()
  const id = rawId.replace(/[^a-zA-Z0-9]/g, '')
  const palette = ART[variant] || ART.hero

  if (src) {
    return (
      <div className={clsx('relative overflow-hidden bg-cream', rounded, ratio, className)}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {children}
      </div>
    )
  }

  return (
    <div
      className={clsx('relative overflow-hidden', rounded, ratio, className)}
      role="img"
      aria-label={alt || 'تصویر نمادین همراهان امید'}
    >
      <svg
        viewBox="0 0 600 450"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={palette.from} />
            <stop offset="1" stopColor={palette.to} />
          </linearGradient>
          <pattern id={`p${id}`} width="54" height="54" patternUnits="userSpaceOnUse">
            <path
              d="M27 7 L47 27 L27 47 L7 27 Z"
              fill="none"
              stroke={palette.line}
              strokeOpacity="0.16"
              strokeWidth="1.1"
            />
            <circle cx="27" cy="27" r="2.6" fill={palette.line} fillOpacity="0.18" />
          </pattern>
          <radialGradient id={`r${id}`} cx="0.76" cy="0.18" r="0.85">
            <stop offset="0" stopColor={palette.accent} stopOpacity="0.42" />
            <stop offset="1" stopColor={palette.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="600" height="450" fill={`url(#g${id})`} />
        <rect width="600" height="450" fill={`url(#p${id})`} />
        <rect width="600" height="450" fill={`url(#r${id})`} />
        <path
          d="M-20 352 C 120 292, 240 396, 360 336 S 560 296, 640 348"
          fill="none"
          stroke={palette.line}
          strokeOpacity="0.32"
          strokeWidth="2"
        />
        <path
          d="M-20 402 C 140 348, 262 442, 402 378 S 580 346, 660 388"
          fill="none"
          stroke={palette.accent}
          strokeOpacity="0.5"
          strokeWidth="2.4"
        />
        <circle cx="468" cy="118" r="48" fill="none" stroke={palette.accent} strokeOpacity="0.45" strokeWidth="1.6" />
        <circle cx="468" cy="118" r="26" fill={palette.accent} fillOpacity="0.2" />
      </svg>
      {children}
    </div>
  )
}

export function Logo({ name = 'همراهان امید', subtitle, tone = 'dark', compact = false, className }) {
  const light = tone === 'light'
  return (
    <span className={clsx('flex items-center gap-3', className)}>
      <span
        className={clsx(
          'grid h-11 w-11 shrink-0 place-items-center rounded-2xl sm:h-12 sm:w-12',
          light ? 'bg-cream/15 text-cream' : 'bg-brand text-cream'
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 40 40" className="h-6 w-6">
          <path
            d="M12 27c0-6.4 3.6-11.4 8-11.4S28 20.6 28 27"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="20" cy="11.5" r="3.1" fill="#D88A52" />
          <path d="M9 30.5h22" stroke="currentColor" strokeOpacity="0.65" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <strong className={clsx('text-[16px] font-semibold', light ? 'text-cream' : 'text-ink')}>
            {name}
          </strong>
          {subtitle && (
            <span className={clsx('mt-1 text-[11px]', light ? 'text-cream/65' : 'text-muted')}>
              {subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  )
}

export function SoftOrb({ className }) {
  return <span className={clsx('pointer-events-none absolute rounded-full blur-3xl', className)} aria-hidden="true" />
}

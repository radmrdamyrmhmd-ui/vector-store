import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { HeartHandshake, Instagram, Mail, Menu, MessageCircle, Phone, Send, X } from 'lucide-react'
import { NAV_ITEMS } from '../lib/nav.js'
import { useSettings } from '../lib/site.jsx'
import { Logo } from './Art.jsx'
import { Button } from './ui.jsx'

export default function Header() {
  const settings = useSettings()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const socials = [
    settings.instagram && { href: settings.instagram, Icon: Instagram, label: 'اینستاگرام' },
    settings.telegram && { href: settings.telegram, Icon: Send, label: 'تلگرام' },
    settings.whatsapp && { href: settings.whatsapp, Icon: MessageCircle, label: 'واتساپ' },
  ].filter(Boolean)

  return (
    <div className="relative">
      <div className="hidden bg-brand-deep text-cream/70 md:block">
        <div className="container-x flex h-10 items-center justify-between text-[11.5px]">
          <div className="flex items-center gap-6">
            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 transition hover:text-cream">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {settings.phone}
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 transition hover:text-cream">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {settings.email}
              </a>
            )}
            {!settings.phone && !settings.email && (
              <span className="text-cream/50">اطلاعات تماس در حال تکمیل است</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/volunteer" className="flex items-center gap-1.5 font-medium text-accent transition hover:text-cream">
              <HeartHandshake className="h-3.5 w-3.5" aria-hidden="true" />
              داوطلب شوید
            </Link>
            {socials.length > 0 && (
              <span className="flex items-center gap-3 border-r border-cream/15 pr-4">
                {socials.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="transition hover:text-cream"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                ))}
              </span>
            )}
          </div>
        </div>
      </div>

      <header
        className={clsx(
          'sticky top-0 z-50 border-b border-line bg-canvas/95 backdrop-blur transition-shadow',
          scrolled && 'shadow-[0_18px_40px_-34px_rgba(23,51,43,0.65)]'
        )}
      >
        <div className="container-x flex h-[68px] items-center justify-between gap-4 lg:h-[78px]">
          <Link to="/" aria-label={settings.site_name || 'همراهان امید'} className="shrink-0 py-1">
            <Logo name={settings.site_name || 'همراهان امید'} subtitle={settings.site_subtitle} />
          </Link>

          <nav aria-label="منوی اصلی" className="hidden items-center gap-0.5 lg:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'whitespace-nowrap rounded-full px-3 py-2 text-[13px] transition',
                    isActive
                      ? 'bg-brand-50 font-medium text-brand'
                      : 'text-ink/70 hover:bg-brand-50/70 hover:text-brand'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button to="/donate" size="sm" className="hidden sm:inline-flex">
              حمایت مالی
            </Button>
            <Link
              to="/donate"
              aria-label="حمایت مالی"
              className="grid h-10 w-10 place-items-center rounded-full bg-accent text-white sm:hidden"
            >
              <HeartHandshake className="h-5 w-5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink transition hover:border-brand/30 hover:text-brand lg:hidden"
              aria-label="باز کردن منو"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="بستن منو"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-brand-deep/50 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="منوی اصلی"
            className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm animate-fade-up flex-col bg-canvas shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo name={settings.site_name || 'همراهان امید'} subtitle={settings.site_subtitle} compact={false} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن منو"
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="منوی موبایل">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    clsx(
                      'block rounded-2xl px-4 py-3 text-[14px] transition',
                      isActive ? 'bg-brand-50 font-medium text-brand' : 'text-ink/80 hover:bg-cream'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="my-3 h-px bg-line" />
              <NavLink to="/volunteer" className="block rounded-2xl px-4 py-3 text-[14px] text-ink/80 hover:bg-cream">
                همکاری و داوطلبی
              </NavLink>
              <NavLink to="/legal" className="block rounded-2xl px-4 py-3 text-[14px] text-ink/80 hover:bg-cream">
                قوانین و حریم خصوصی
              </NavLink>
            </nav>
            <div className="border-t border-line px-5 py-5">
              <Button to="/donate" className="w-full">
                حمایت مالی
              </Button>
              <div className="mt-4 space-y-1.5 text-[12px] text-muted">
                {settings.phone && <p>تلفن: {settings.phone}</p>}
                {settings.email && <p>ایمیل: {settings.email}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

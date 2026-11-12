import { Link } from 'react-router-dom'
import { Instagram, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import {
  FOOTER_ABOUT_LINKS,
  FOOTER_CONTACT_LINKS,
  FOOTER_LEGAL_LINKS,
  FOOTER_QUICK_LINKS,
} from '../lib/nav.js'
import { useSettings } from '../lib/site.jsx'
import { Logo } from './Art.jsx'

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-[13px] font-semibold text-cream">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={`${title}-${link.to}-${link.label}`}>
            <Link to={link.to} className="text-[12.5px] text-cream/65 transition hover:text-accent">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const settings = useSettings()
  const socials = [
    settings.instagram && { href: settings.instagram, Icon: Instagram, label: 'اینستاگرام' },
    settings.telegram && { href: settings.telegram, Icon: Send, label: 'تلگرام' },
    settings.whatsapp && { href: settings.whatsapp, Icon: MessageCircle, label: 'واتساپ' },
  ].filter(Boolean)

  const hasContact = Boolean(settings.phone || settings.email || settings.address)

  return (
    <footer className="mt-20 bg-brand-deep text-cream">
      <div className="container-x py-14 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo
              tone="light"
              name={settings.site_name || 'همراهان امید'}
              subtitle={settings.site_subtitle}
            />
            <p className="mt-5 max-w-xs text-[12.5px] leading-7 text-cream/60">
              {settings.footer_about ||
                'همراهان امید مجموعه‌ای مردم‌نهاد است که برای فراهم کردن فرصت‌های آموزش، سلامت و توانمندسازی زنان و کودکان بلوچ فعالیت می‌کند.'}
            </p>
            {socials.length > 0 && (
              <div className="mt-6 flex items-center gap-2.5">
                {socials.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-full border border-cream/15 text-cream/70 transition hover:border-accent hover:text-accent"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <FooterColumn title="دسترسی سریع" links={FOOTER_QUICK_LINKS} />

          <div>
            <h3 className="text-[13px] font-semibold text-cream">ارتباط با ما</h3>
            <ul className="mt-4 space-y-2.5 text-[12.5px] text-cream/65">
              {settings.phone && (
                <li>
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-2 transition hover:text-accent">
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-2 transition hover:text-accent">
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2 leading-6">
                  <MapPin className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {settings.address}
                </li>
              )}
              {!hasContact && <li className="text-cream/45">اطلاعات تماس در حال تکمیل است</li>}
              {FOOTER_CONTACT_LINKS.map((link) => (
                <li key={link.to + link.label}>
                  <Link to={link.to} className="transition hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn title="اطلاعات حقوقی و اعتماد" links={FOOTER_LEGAL_LINKS} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-cream/10 pt-6 text-[11.5px] text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            تمامی حقوق این وب‌سایت متعلق به {settings.legal_owner || 'مجموعه همراهان امید'} است.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/legal#terms" className="transition hover:text-cream">
              قوانین و مقررات
            </Link>
            <Link to="/legal#privacy" className="transition hover:text-cream">
              حریم خصوصی
            </Link>
            <Link to="/admin" className="transition hover:text-cream">
              ورود مدیران
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

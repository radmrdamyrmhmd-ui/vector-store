import { Instagram, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { useSettings } from '../lib/site.jsx'
import { ContactForm } from '../components/forms.jsx'
import { PageHero } from '../components/ui.jsx'
import { Breadcrumbs } from '../components/blocks.jsx'

export default function Contact() {
  const settings = useSettings()

  const items = [
    settings.phone && {
      icon: Phone,
      label: 'تلفن',
      value: settings.phone,
      href: `tel:${settings.phone}`,
      hint: 'شنبه تا چهارشنبه، ۹ تا ۱۷',
    },
    settings.email && {
      icon: Mail,
      label: 'ایمیل',
      value: settings.email,
      href: `mailto:${settings.email}`,
      hint: 'پاسخ‌گویی حداکثر دو روز کاری',
    },
    settings.address && {
      icon: MapPin,
      label: 'نشانی',
      value: settings.address,
    },
  ].filter(Boolean)

  const socials = [
    settings.instagram && { href: settings.instagram, Icon: Instagram, label: 'اینستاگرام' },
    settings.telegram && { href: settings.telegram, Icon: Send, label: 'تلگرام' },
    settings.whatsapp && { href: settings.whatsapp, Icon: MessageCircle, label: 'واتساپ' },
  ].filter(Boolean)

  return (
    <>
      <PageHero
        eyebrow="تماس با ما"
        title="بیایید گفت‌وگو را شروع کنیم"
        text="برای همکاری، کمک مالی، پیشنهاد پروژه یا هر پرسشی درباره فعالیت‌های مجموعه، از راه‌های زیر با ما در تماس باشید."
      />

      <section className="py-12 sm:py-16">
        <div className="container-x">
          <Breadcrumbs items={[{ label: 'تماس با ما' }]} />

          <div className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="space-y-4">
              {items.length === 0 ? (
                <div className="rounded-[26px] border border-dashed border-line bg-white/70 p-6 text-[12.5px] leading-7 text-muted">
                  اطلاعات تماس مجموعه هنوز در سامانه ثبت نشده است. مدیران می‌توانند آن را از پنل
                  مدیریت تکمیل کنند.
                </div>
              ) : (
                items.map(({ icon: Icon, label, value, href, hint }) => (
                  <div key={label} className="rounded-[26px] border border-line bg-white p-5">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11.5px] text-muted">{label}</p>
                        {href ? (
                          <a
                            href={href}
                            dir={label === 'تلفن' ? 'ltr' : undefined}
                            className="mt-1 block break-words text-[14px] font-medium text-ink transition hover:text-brand"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="mt-1 text-[13.5px] leading-7 text-ink">{value}</p>
                        )}
                        {hint && <p className="mt-1.5 text-[10.5px] text-muted">{hint}</p>}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {socials.length > 0 && (
                <div className="rounded-[26px] border border-line bg-cream/60 p-5">
                  <p className="text-[12px] font-medium text-ink">شبکه‌های اجتماعی</p>
                  <div className="mt-3 flex gap-2.5">
                    {socials.map(({ href, Icon, label }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={label}
                        className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink/70 transition hover:border-brand/30 hover:text-brand"
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-[26px] bg-brand p-6 text-cream">
                <h2 className="text-[15px]">پیشنهاد پروژه یا همکاری سازمانی</h2>
                <p className="mt-2 text-[12px] leading-7 text-cream/70">
                  اگر نهاد، مدرسه یا گروهی هستید که می‌تواند در اجرای پروژه‌ها همراهی کند، در فرم
                  پیام موضوع «همکاری» را انتخاب کنید.
                </p>
              </div>
            </aside>

            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}

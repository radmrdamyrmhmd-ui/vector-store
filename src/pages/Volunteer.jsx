import { BookOpen, HeartHandshake, Megaphone, Palette, Settings2, Users } from 'lucide-react'
import { useSite } from '../lib/site.jsx'
import { VolunteerForm } from '../components/forms.jsx'
import { PageHero } from '../components/ui.jsx'
import { Breadcrumbs, PrivacyNote } from '../components/blocks.jsx'

const AREAS = [
  { icon: BookOpen, title: 'آموزش', text: 'تدریس، کمک آموزشی و همراهی تحصیلی کودکان.' },
  { icon: Users, title: 'فعالیت اجتماعی', text: 'همراهی در بازدیدها و برنامه‌های محلی.' },
  { icon: Megaphone, title: 'تولید محتوا', text: 'نوشتن گزارش، عکاسی و تولید محتوای respectful.' },
  { icon: Palette, title: 'طراحی و برنامه‌نویسی', text: 'کمک به توسعه ابزارها و هویت بصری مجموعه.' },
  { icon: Settings2, title: 'پشتیبانی اجرایی', text: 'هماهنگی برنامه‌ها و پشتیبانی دفتری.' },
  { icon: HeartHandshake, title: 'کمک‌های مردمی', text: 'همراهی در جمع‌آوری و توزیع کمک‌ها.' },
]

export default function Volunteer() {
  const { volunteerInterests } = useSite()

  return (
    <>
      <PageHero
        eyebrow="همکاری و داوطلبی"
        title="تو هم می‌توانی بخشی از این تغییر باشی"
        text="برای ساختن آینده‌ای بهتر، به همراهی انسان‌هایی نیاز داریم که به تغییر باور دارند. زمان، مهارت و همراهی شما می‌تواند مسیر یک کودک را تغییر دهد."
      />

      <section className="py-12 sm:py-16">
        <div className="container-x">
          <Breadcrumbs items={[{ label: 'همکاری و داوطلبی' }]} />

          <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <VolunteerForm interests={volunteerInterests?.length ? volunteerInterests : undefined} />

            <aside className="space-y-4">
              <div className="rounded-[26px] border border-line bg-white p-6">
                <h2 className="text-[16px] text-ink">زمینه‌های همکاری</h2>
                <ul className="mt-4 space-y-4">
                  {AREAS.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cream text-brand">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-[13px] font-medium text-ink">{title}</p>
                        <p className="mt-1 text-[11.5px] leading-6 text-muted">{text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[26px] bg-brand p-6 text-cream">
                <h2 className="text-[16px]">پس از ثبت درخواست چه می‌شود؟</h2>
                <ol className="mt-3 space-y-2 text-[12px] leading-7 text-cream/75">
                  <li>۱. درخواست شما در پنل مدیریت ثبت می‌شود.</li>
                  <li>۲. همکاران ما برای گفت‌وگوی کوتاه با شما تماس می‌گیرند.</li>
                  <li>۳. بر اساس زمان و مهارت شما، همکاری شروع می‌شود.</li>
                </ol>
              </div>
            </aside>
          </div>

          <PrivacyNote>
            اطلاعات داوطلبان فقط برای بررسی درخواست همکاری استفاده می‌شود و در دسترس عموم قرار
            نمی‌گیرد.
          </PrivacyNote>
        </div>
      </section>
    </>
  )
}

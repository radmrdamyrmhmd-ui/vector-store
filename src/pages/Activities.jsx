import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, HeartHandshake, ShoppingBasket, Sparkles } from 'lucide-react'
import { useSite } from '../lib/site.jsx'
import { Artwork } from '../components/Art.jsx'
import { Button, Empty, PageHero, SectionHead } from '../components/ui.jsx'
import { Breadcrumbs, CtaBand, PrivacyNote } from '../components/blocks.jsx'
import Reveal from '../components/Reveal.jsx'

const ICONS = {
  book: BookOpen,
  sparkles: Sparkles,
  basket: ShoppingBasket,
  heart: HeartHandshake,
}

const VARIANT_BY_SLUG = {
  education: 'education',
  'women-empowerment': 'women',
  livelihood: 'livelihood',
  health: 'health',
}

export default function Activities() {
  const { activities, loading } = useSite()

  return (
    <>
      <PageHero
        eyebrow="حوزه‌های فعالیت"
        title="چهار مسیر برای ساختن فرصت"
        text="هر حوزه فعالیت ما یک زنجیره مشخص دارد: شناسایی نیاز، اجرای برنامه و گزارش نتیجه. با انتخاب هر حوزه می‌توانید جزئیات آن را ببینید."
      />

      <section className="py-14 sm:py-16">
        <div className="container-x">
          <Breadcrumbs items={[{ label: 'فعالیت‌های ما' }]} />

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-48 animate-pulse rounded-[26px] bg-cream/70" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <Empty
              title="حوزه‌های فعالیت در حال به‌روزرسانی است"
              text="اطلاعات این بخش از پنل مدیریت تکمیل می‌شود."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {activities.map((activity, index) => {
                const Icon = ICONS[activity.icon] || HeartHandshake
                return (
                  <Reveal key={activity.slug} delay={index * 60}>
                    <article className="flex h-full flex-col overflow-hidden rounded-[26px] border border-line bg-white">
                      <Artwork
                        variant={VARIANT_BY_SLUG[activity.slug] || 'about'}
                        src={activity.image_url}
                        alt={activity.title}
                        ratio="aspect-[16/8]"
                        rounded="rounded-none"
                      />
                      <div className="flex flex-1 flex-col p-6">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <h2 className="mt-4 text-[19px] text-ink">{activity.title}</h2>
                        <p className="mt-2 flex-1 text-[13px] leading-7 text-muted">{activity.summary}</p>
                        <Link
                          to={`/activities/${activity.slug}`}
                          className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand"
                        >
                          مشاهده جزئیات
                          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-cream/50 py-14">
        <div className="container-x">
          <SectionHead
            eyebrow="چطور کمک می‌رسد؟"
            title="مسیر اجرای هر فعالیت"
            text="هر فعالیت با ارزیابی نیاز آغاز می‌شود و با گزارش نتیجه پایان می‌یابد."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { title: 'ارزیابی نیاز', text: 'شناسایی خانواده‌ها و کودکان با همراهی شبکه محلی.' },
              { title: 'اجرای برنامه', text: 'تأمین منابع، برگزاری دوره‌ها و پیگیری مستمر.' },
              { title: 'گزارش نتیجه', text: 'ثبت مستندات و انتشار خلاصه در گزارش عملکرد.' },
            ].map((step) => (
              <div key={step.title} className="rounded-[22px] border border-line bg-white p-6">
                <p className="text-[14px] font-semibold text-ink">{step.title}</p>
                <p className="mt-2 text-[12.5px] leading-7 text-muted">{step.text}</p>
              </div>
            ))}
          </div>
          <PrivacyNote />
        </div>
      </section>

      <CtaBand />
    </>
  )
}

import { Compass, Flag, HeartHandshake, Lightbulb, ListChecks, Target, Users } from 'lucide-react'
import { useSettings } from '../lib/site.jsx'
import { PageHero, SectionHead } from '../components/ui.jsx'
import { Breadcrumbs, CtaBand, PrivacyNote } from '../components/blocks.jsx'
import Reveal from '../components/Reveal.jsx'

const OBJECTIVES = [
  {
    icon: Target,
    title: 'فراهم کردن فرصت آموزش',
    text: 'حمایت از ادامه تحصیل کودکان، تأمین لوازم آموزشی و کاهش موانع اقتصادی پیش روی خانواده‌ها.',
  },
  {
    icon: Lightbulb,
    title: 'توانمندسازی اقتصادی زنان',
    text: 'برگزاری دوره‌های مهارت‌آموزی و همراهی برای رسیدن به درآمد پایدار و استقلال اقتصادی.',
  },
  {
    icon: HeartHandshake,
    title: 'حمایت معیشتی هدفمند',
    text: 'کمک به تأمین نیازهای ضروری خانواده‌های کم‌برخوردار بر اساس ارزیابی نیاز واقعی.',
  },
  {
    icon: Users,
    title: 'دسترسی به سلامت',
    text: 'همراهی در هزینه‌های درمانی ضروری و ارائه بسته‌های بهداشتی مادر و کودک.',
  },
  {
    icon: ListChecks,
    title: 'شفافیت و پاسخ‌گویی',
    text: 'انتشار منظم گزارش عملکرد و هزینه‌کرد منابع، برای ساختن اعتماد پایدار.',
  },
  {
    icon: Flag,
    title: 'مشارکت مردمی',
    text: 'ایجاد بستر مشارکت داوطلبان و اهداکنندگان در طراحی و اجرای فعالیت‌ها.',
  },
]

const STEPS = [
  { title: 'شناسایی نیاز', text: 'با همراهی معلمان، بهورزان و فعالان محلی، نیاز واقعی خانواده‌ها مشخص می‌شود.' },
  { title: 'طراحی پروژه', text: 'برای هر نیاز، یک پروژه با هدف، محدوده و منابع مشخص تعریف می‌شود.' },
  { title: 'اجرا و پیگیری', text: 'اجرای پروژه با همراهی محلی انجام و پیشرفت آن مستند می‌شود.' },
  { title: 'گزارش‌دهی', text: 'نتیجه و هزینه‌کرد در گزارش عملکرد منتشر و در دسترس عموم قرار می‌گیرد.' },
]

export default function Mission() {
  const settings = useSettings()

  return (
    <>
      <PageHero
        eyebrow="مأموریت و اهداف"
        title="مسیر ما برای ساختن فرصت‌های برابر"
        text={settings.mission_text}
      />

      <section className="py-14 sm:py-16">
        <div className="container-x">
          <Breadcrumbs items={[{ label: 'مأموریت و اهداف' }]} />

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[26px] border border-line bg-white p-7">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand">
                <Compass className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-[20px] text-ink">مأموریت</h2>
              <p className="mt-3 text-[13px] leading-8 text-muted">
                {settings.mission_text}
              </p>
              <p className="mt-3 text-[13px] leading-8 text-muted">
                تمرکز ما بر آموزش، توانمندسازی و حمایت اجتماعی است تا زنان و کودکان بلوچ بتوانند
                آینده خود را با کرامت و استقلال بسازند.
              </p>
            </div>
            <div className="rounded-[26px] border border-line bg-cream/70 p-7">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-accent-dark">
                <Flag className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-[20px] text-ink">چشم‌انداز</h2>
              <p className="mt-3 text-[13px] leading-8 text-muted">
                جامعه‌ای که در آن هیچ کودک به دلیل شرایط اقتصادی از آموزش محروم نمی‌شود و هر زن
                می‌تواند با مهارت و درآمد خود، زندگی خانواده‌اش را بسازد.
              </p>
              <p className="mt-3 text-[13px] leading-8 text-muted">
                این چشم‌انداز بدون مشارکت مردم، داوطلبان و نهادهای محلی محقق نمی‌شود.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream/50 py-14 sm:py-16">
        <div className="container-x">
          <SectionHead
            eyebrow="اهداف"
            title="اهداف مشخص و قابل پیگیری"
            text="هر هدف به پروژه‌ای مشخص وصل است و پیشرفت آن در گزارش‌های مالی و عملکرد قابل مشاهده است."
          />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OBJECTIVES.map(({ icon: Icon, title, text }, index) => (
              <Reveal key={title} delay={index * 50}>
                <div className="h-full rounded-[24px] border border-line bg-white p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream text-brand">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[15px] text-ink">{title}</h3>
                  <p className="mt-2 text-[12.5px] leading-7 text-muted">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="container-x">
          <SectionHead eyebrow="روش کار" title="از نیاز تا گزارش" text="چرخه فعالیت ما در چهار گام مشخص انجام می‌شود." />
          <ol className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-[24px] border border-line bg-white p-6">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-[13px] font-semibold text-cream">
                  {(index + 1).toLocaleString('fa-IR')}
                </span>
                <h3 className="mt-4 text-[15px] text-ink">{step.title}</h3>
                <p className="mt-2 text-[12.5px] leading-7 text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
          <PrivacyNote />
        </div>
      </section>

      <CtaBand />
    </>
  )
}

import { BadgeCheck, HeartHandshake, Leaf, Scale, Users } from 'lucide-react'
import { useSettings } from '../lib/site.jsx'
import { Artwork } from '../components/Art.jsx'
import { Button, PageHero, SectionHead } from '../components/ui.jsx'
import { Breadcrumbs, CtaBand, PrivacyNote } from '../components/blocks.jsx'
import Reveal from '../components/Reveal.jsx'
import { paragraphs } from '../lib/format.js'

const VALUES = [
  {
    icon: HeartHandshake,
    title: 'کرامت انسانی',
    text: 'هیچ کمکی با نمایش رنج یا ترحم همراه نیست. افراد با نام و داستان خودشان، فقط با رضایت آگاهانه، دیده می‌شوند.',
  },
  {
    icon: Scale,
    title: 'شفافیت',
    text: 'منابع مالی، هزینه‌ها و پیشرفت پروژه‌ها در گزارش‌های عمومی ثبت می‌شود؛ بدون عدد تخمینی و ادعای غیرواقعی.',
  },
  {
    icon: Users,
    title: 'مشارکت محلی',
    text: 'تصمیم‌ها با همراهی معلمان، مادران و فعالان محلی گرفته می‌شود تا کمک‌ها با نیاز واقعی جامعه هماهنگ باشد.',
  },
  {
    icon: Leaf,
    title: 'پایداری',
    text: 'به‌جای کمک‌های مقطعی، بر آموزش و مهارت‌آموزی تمرکز می‌کنیم تا اثر حمایت در زندگی افراد ماندگار بماند.',
  },
]

export default function About() {
  const settings = useSettings()

  return (
    <>
      <PageHero
        eyebrow="درباره ما"
        title={settings.about_title || 'ما برای ساختن امید کنار هم هستیم'}
        text="همراهان امید مجموعه‌ای مردم‌نهاد است که در کنار زنان و کودکان بلوچ ایستاده تا فرصت‌های آموزش، سلامت و استقلال اقتصادی را برای آن‌ها واقعی‌تر کند."
      />

      <section className="py-14 sm:py-16">
        <div className="container-x">
          <Breadcrumbs items={[{ label: 'درباره ما' }]} />
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <span className="eyebrow">معرفی مجموعه</span>
              <h2 className="mt-4 text-[24px] leading-[1.55] text-ink sm:text-[28px]">
                چرا همراهان امید شکل گرفت؟
              </h2>
              <div className="mt-4 space-y-4 text-[14px] leading-8 text-muted">
                {paragraphs(settings.about_text).map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
              <p className="mt-4 text-[14px] leading-8 text-muted">
                ما باور داریم تغییر پایدار از دل جامعه آغاز می‌شود؛ به همین دلیل فعالیت‌های ما با
                مشورت و همراهی خانواده‌ها، معلمان و فعالان محلی طراحی می‌شود. هر تصمیم بر پایه نیاز
                واقعی و با کمترین دخالت در زندگی خصوصی افراد گرفته می‌شود.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button to="/mission" variant="outline">
                  مأموریت و اهداف
                </Button>
                <Button to="/transparency" variant="ghost">
                  گزارش شفافیت مالی
                </Button>
              </div>
            </div>

            <Reveal className="relative">
              <Artwork
                variant="about"
                src={settings.about_image}
                alt="همراهی با زنان و کودکان بلوچ"
                ratio="aspect-[4/3]"
                className="shadow-soft"
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-line bg-white px-4 py-4">
                  <p className="text-[11px] text-muted">حوزه‌های فعالیت</p>
                  <p className="mt-1 text-[15px] font-semibold text-ink">آموزش، معیشت، سلامت</p>
                </div>
                <div className="rounded-2xl border border-line bg-white px-4 py-4">
                  <p className="text-[11px] text-muted">تمرکز جغرافیایی</p>
                  <p className="mt-1 text-[15px] font-semibold text-ink">مناطق بلوچ‌نشین</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-cream/50 py-14 sm:py-16">
        <div className="container-x">
          <SectionHead
            eyebrow="اصول ما"
            title="چهار اصلی که در همه فعالیت‌ها رعایت می‌شود"
            text="این اصول، معیار تصمیم‌گیری ما در انتخاب پروژه‌ها، انتشار محتوا و مدیریت منابع است."
          />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }, index) => (
              <Reveal key={title} delay={index * 60}>
                <div className="h-full rounded-[24px] border border-line bg-white p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[16px] text-ink">{title}</h3>
                  <p className="mt-2 text-[12.5px] leading-7 text-muted">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="container-x">
          <div className="grid gap-8 rounded-[28px] border border-line bg-white p-7 sm:p-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <span className="eyebrow-accent">تعهد اخلاقی</span>
              <h2 className="mt-4 text-[22px] leading-[1.55] text-ink sm:text-[26px]">
                چگونه از افراد و تصاویر استفاده می‌کنیم؟
              </h2>
              <p className="mt-3 text-[13px] leading-8 text-muted">
                داستان‌ها و تصاویر فقط با رضایت آگاهانه و با تمرکز بر توانمندی، امید و کرامت افراد
                منتشر می‌شوند. اطلاعات هویتی کودکان در هیچ صفحه‌ای منتشر نمی‌شود و از کلیشه‌سازی
                فرهنگی و قومی پرهیز می‌کنیم.
              </p>
              <PrivacyNote />
            </div>
            <ul className="space-y-4">
              {[
                'انتشار تصاویر و روایت‌ها فقط با رضایت آگاهانه افراد و خانواده‌ها',
                'پرهیز از نمایش اغراق‌آمیز رنج و فقر برای جذب کمک',
                'حفاظت از اطلاعات هویتی کودکان و خانواده‌های تحت حمایت',
                'انتشار آمار فقط بر پایه مستندات واقعی مجموعه',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl bg-cream/60 px-4 py-3">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                  <span className="text-[12.5px] leading-7 text-ink/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  )
}

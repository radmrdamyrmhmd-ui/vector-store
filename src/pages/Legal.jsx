import { useSettings } from '../lib/site.jsx'
import { PageHero } from '../components/ui.jsx'
import { Breadcrumbs } from '../components/blocks.jsx'

const TERMS = [
  {
    title: '۱. استفاده از وب‌سایت',
    text: 'محتوای این وب‌سایت برای معرفی فعالیت‌ها، انتشار گزارش‌ها و دریافت کمک‌های مردمی منتشر می‌شود. استفاده از مطالب با ذکر منبع آزاد است، اما تغییر یا بازنشر گمراه‌کننده مجاز نیست.',
  },
  {
    title: '۲. کمک‌های مالی',
    text: 'هر کمک با کد پیگیری یکتا ثبت می‌شود. کمک فقط زمانی «دریافت‌شده» محسوب می‌شود که درگاه پرداخت آن را تأیید کند. کمک‌های تأییدنشده در گزارش‌های مالی ثبت نمی‌شوند.',
  },
  {
    title: '۳. بازگشت کمک',
    text: 'در صورت بروز خطای فنی در پرداخت، موضوع از طریق صفحه تماس پیگیری و نتیجه به اهداکننده اعلام می‌شود. بازگشت مبالغ تابع قوانین درگاه پرداخت است.',
  },
  {
    title: '۴. محتوای منتشرشده',
    text: 'همراهان امید هیچ آمار، داستان یا تصویری را بدون مستندات و رضایت آگاهانه افراد منتشر نمی‌کند. اگر به‌عنوان صاحب محتوا درخواست حذف دارید، از طریق صفحه تماس با ما اطلاع دهید.',
  },
  {
    title: '۵. مسئولیت‌پذیری',
    text: 'اطلاعات این وب‌سایت با دقت منتشر می‌شود. اگر خطایی مشاهده کردید، با ما تماس بگیرید تا در اولین فرصت اصلاح شود.',
  },
]

const PRIVACY = [
  {
    title: '۱. اطلاعاتی که ثبت می‌کنیم',
    text: 'در فرم‌های کمک، داوطلبی، تماس و خبرنامه، اطلاعاتی مانند نام، شماره تماس، ایمیل و توضیحات شما ثبت می‌شود. این اطلاعات فقط برای همان درخواست استفاده می‌شود.',
  },
  {
    title: '۲. دسترسی به اطلاعات',
    text: 'اطلاعات اهداکنندگان، داوطلبان و پیام‌ها فقط برای مدیران مجاز مجموعه قابل مشاهده است و در صفحات عمومی نمایش داده نمی‌شود.',
  },
  {
    title: '۳. اطلاعات افراد تحت حمایت',
    text: 'اطلاعات هویتی کودکان و خانواده‌های تحت حمایت، از جمله تصاویر شناسایی‌پذیر، در این وب‌سایت منتشر نمی‌شود.',
  },
  {
    title: '۴. خبرنامه',
    text: 'عضویت در خبرنامه اختیاری است و می‌توانند در هر زمان با تماس با مجموعه از فهرست خبرنامه حذف شوید.',
  },
  {
    title: '۵. امنیت',
    text: 'ارتباط با سایت از طریق HTTPS انجام می‌شود، رمزهای عبور مدیران به‌صورت رمزنگاری‌شده ذخیره می‌شود و دسترسی به پنل مدیریت فقط برای کاربران دارای نقش مدیر ممکن است.',
  },
]

function LegalBlock({ id, title, intro, items }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-[22px] text-ink">{title}</h2>
      <p className="mt-3 text-[13px] leading-8 text-muted">{intro}</p>
      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <div key={item.title} className="rounded-[22px] border border-line bg-white p-5">
            <h3 className="text-[14px] font-medium text-ink">{item.title}</h3>
            <p className="mt-2 text-[12.5px] leading-7 text-muted">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Legal() {
  const settings = useSettings()

  return (
    <>
      <PageHero
        eyebrow="اطلاعات حقوقی"
        title="قوانین و حریم خصوصی"
        text="این صفحه چارچوب استفاده از وب‌سایت و نحوه نگهداری اطلاعات را توضیح می‌دهد. آخرین به‌روزرسانی این متن از طریق پنل مدیریت قابل ثبت است."
      />

      <section className="py-12 sm:py-16">
        <div className="container-x max-w-4xl">
          <Breadcrumbs items={[{ label: 'قوانین و حریم خصوصی' }]} />
          <div className="space-y-14">
            <LegalBlock
              id="terms"
              title="قوانین و مقررات"
              intro={`استفاده از این وب‌سایت به معنی پذیرش قوانین زیر است. این قوانین توسط ${settings.site_name || 'همراهان امید'} مدیریت می‌شود.`}
              items={TERMS}
            />
            <LegalBlock
              id="privacy"
              title="حریم خصوصی"
              intro="ما اطلاعات شما را فقط برای ارائه خدمت و پاسخ‌گویی به درخواست‌ها استفاده می‌کنیم."
              items={PRIVACY}
            />
          </div>

          <div className="mt-12 rounded-[22px] border border-line bg-cream/60 p-6 text-[12px] leading-7 text-muted">
            <p>
              برای پرسش درباره این متن یا درخواست اصلاح اطلاعات، از صفحه{' '}
              <a href="/contact" className="text-brand underline underline-offset-4">
                تماس با ما
              </a>{' '}
              استفاده کنید.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

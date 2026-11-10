import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';
import { InstagramIcon, TelegramIcon, WhatsappIcon, YoutubeIcon } from './icons';

const COLUMNS = [
  {
    title: 'مشتریان',
    links: [
      { label: 'راهنمای خرید', to: '/info/shopping-guide' },
      { label: 'روش‌های ارسال', to: '/info/shipping' },
      { label: 'شرایط بازگشت کالا', to: '/info/returns' },
      { label: 'جدول سایزبندی', to: '/info/sizing' },
      { label: 'سوالات متداول', to: '/info/faq' },
    ],
  },
  {
    title: 'درباره یاس',
    links: [
      { label: 'داستان برند', to: '/info/brand-story' },
      { label: 'درباره ما', to: '/info/about' },
      { label: 'همکاری با ما', to: '/info/partnership' },
      { label: 'فرصت‌های شغلی', to: '/info/careers' },
    ],
  },
  {
    title: 'پشتیبانی',
    links: [
      { label: 'تماس با ما', to: '/contact' },
      { label: 'پیگیری سفارش', to: '/account' },
      { label: 'قوانین و مقررات', to: '/info/terms' },
      { label: 'ضمانت محصولات', to: '/info/warranty' },
    ],
  },
];

const SOCIALS = [
  { label: 'اینستاگرام', icon: InstagramIcon },
  { label: 'تلگرام', icon: TelegramIcon },
  { label: 'یوتیوب', icon: YoutubeIcon },
  { label: 'واتساپ', icon: WhatsappIcon },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer__top">
        <div className="footer__brand">
          <Link to="/" className="brand">
            <BrandMark />
            <span className="brand-name">
              <b>YAS</b>
              <span>SPORTS</span>
            </span>
          </Link>
          <p>
            یاس اسپورت، خانه‌ی کفش و پوشاک ورزشی؛ طراحی‌شده برای کسانی که حرکت را بخشی از سبک
            زندگی خود می‌دانند.
          </p>
          <div className="socials socials--dark">
            {SOCIALS.map(({ label, icon: Icon }) => (
              <span key={label} title={`${label} — به‌زودی`} aria-label={label} role="img">
                <Icon />
              </span>
            ))}
          </div>
        </div>

        <div className="footer__cols">
          {COLUMNS.map((column) => (
            <div className="footer__col" key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.to + link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer__col">
            <h4>روش‌های پرداخت</h4>
            <div className="footer__pay">
              <span className="pay-chip">پرداخت هنگام تحویل</span>
            </div>
            <p className="footer__note">
              درگاه پرداخت آنلاین هنوز به فروشگاه متصل نشده است؛ سفارش‌ها پس از ثبت توسط پشتیبانی
              تأیید می‌شوند.
            </p>
          </div>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>تمام حقوق این وب‌سایت متعلق به YAS SPORTS است.</span>
        <span>۱۴۰۵</span>
      </div>

      <div className="footer__wordmark" aria-hidden="true">
        YAS SPORTS
      </div>
    </footer>
  );
}

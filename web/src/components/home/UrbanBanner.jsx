import { Link } from 'react-router-dom';
import Reveal from '../Reveal';
import { ArrowUpRight, CompassIcon, FeatherIcon, LayersIcon } from '../icons';

const FEATURES = [
  {
    icon: LayersIcon,
    title: 'متریال باکیفیت',
    text: 'استفاده از مواد اولیه باکیفیت، مقاوم و راحت برای استفاده روزانه.',
  },
  {
    icon: FeatherIcon,
    title: 'راحتی در هر قدم',
    text: 'طراحی ارگونومیک و زیره مناسب برای تجربه حرکتی راحت‌تر.',
  },
  {
    icon: CompassIcon,
    title: 'استایل بدون محدودیت',
    text: 'انتخابی مناسب برای تمرین، پیاده‌روی و زندگی شهری.',
  },
];

export default function UrbanBanner() {
  return (
    <section className="urban">
      <div className="container">
        <div className="urban__inner">
          <Reveal className="urban__media">
            <img src="/images/banner-urban.jpg" alt="ورزشکار خانم یاس اسپورت در معماری شهری" loading="lazy" />
            <span className="urban__label">YAS URBAN SERIES</span>
          </Reveal>

          <Reveal className="urban__text-col" delay={100}>
            <h2 className="urban__title">
              شهر را
              <br />
              با استایل
              <br />
              و راحتی
              <br />
              کشف کن
            </h2>
            <p className="urban__text">
              کالکشن شهری یاس اسپورت ترکیبی از طراحی مینیمال، متریال سبک و راحتی تمام‌روز است؛
              ساخته‌شده برای رفت‌وآمد روزانه و حرکت بی‌وقفه در شهر.
            </p>
            <div className="urban__actions">
              <Link to="/shop?category=lifestyle" className="btn btn-light">
                از دنیای یاس الهام بگیر
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="urban__features">
          {FEATURES.map(({ icon: Icon, title, text }, index) => (
            <Reveal className="feature" key={title} delay={index * 90}>
              <span className="feature__icon">
                <Icon size={21} />
              </span>
              <div>
                <h3 className="feature__title">{title}</h3>
                <p className="feature__text">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { ArrowUpRight } from '../icons';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__media">
        <img src="/images/hero-athlete.jpg" alt="ورزشکار یاس اسپورت در فضای شهری با کتانی ورزشی" />
      </div>
      <div className="hero__shade" />

      <div className="hero__inner">
        <div>
          <p className="hero__kicker">YAS SPORTS — کالکشن ۱۴۰۵</p>
          <h1 className="hero__title">
            فراتر از حرکت
            <br />
            برای آینده آماده شو
          </h1>
          <p className="hero__text">
            استایل خودت را پیدا کن.
            <br />
            با کیفیت حرکت کن.
            <br />
            هر روز یک قدم جلوتر باش.
          </p>
          <div className="hero__actions">
            <Link to="/shop" className="btn btn-light">
              مشاهده محصولات
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>

        <div className="hero__aside">
          <div className="hero__badge">
            <span className="hero__badge-ring">+</span>
            <span>راحتی، عملکرد، کیفیت</span>
          </div>
          <a href="#collection" className="hero__scroll">
            برای کشف بیشتر اسکرول کنید
            <span>↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}

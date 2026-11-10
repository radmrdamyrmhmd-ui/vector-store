import Reveal from '../Reveal';
import { HeadsetIcon, RefreshIcon, ShieldIcon, TruckIcon } from '../icons';

const ITEMS = [
  { icon: TruckIcon, title: 'ارسال سریع', text: 'ارسال سفارش‌ها در کوتاه‌ترین زمان ممکن.' },
  { icon: ShieldIcon, title: 'ضمانت اصالت', text: 'اطمینان از اصالت و کیفیت محصولات.' },
  { icon: HeadsetIcon, title: 'پشتیبانی مشتریان', text: 'پاسخ‌گویی و راهنمایی پیش از خرید و پس از آن.' },
  { icon: RefreshIcon, title: 'امکان تعویض', text: 'امکان درخواست تعویض مطابق با قوانین فروشگاه.' },
];

export default function Usps() {
  return (
    <section className="usps">
      <div className="container">
        <div className="usps__grid">
          {ITEMS.map(({ icon: Icon, title, text }, index) => (
            <Reveal className="usp" key={title} delay={index * 70}>
              <span className="usp__icon">
                <Icon size={24} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

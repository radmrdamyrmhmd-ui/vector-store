import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { faNum, formatPrice, toEnglishDigits } from '../lib/format';
import { CheckIcon } from '../components/icons';

const PROVINCES = [
  'آذربایجان شرقی', 'آذربایجان غربی', 'اردبیل', 'اصفهان', 'البرز', 'ایلام', 'بوشهر', 'تهران',
  'چهارمحال و بختیاری', 'خراسان جنوبی', 'خراسان رضوی', 'خراسان شمالی', 'خوزستان', 'زنجان',
  'سمنان', 'سیستان و بلوچستان', 'فارس', 'قزوین', 'قم', 'کردستان', 'کرمان', 'کرمانشاه',
  'کهگیلویه و بویراحمد', 'گلستان', 'گیلان', 'لرستان', 'مازندران', 'مرکزی', 'هرمزگان', 'همدان', 'یزد',
];

const EMPTY = {
  fullName: '',
  mobile: '',
  province: '',
  city: '',
  address: '',
  postalCode: '',
};

export default function CheckoutPage() {
  const { items, totals, clear } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({ ...EMPTY, fullName: user?.name || '' });
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    document.title = 'تسویه حساب | YAS SPORTS';
  }, []);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const customer = {
      ...form,
      mobile: toEnglishDigits(form.mobile).replace(/\s|-/g, ''),
      postalCode: toEnglishDigits(form.postalCode).replace(/\s|-/g, ''),
    };

    if (!customer.fullName.trim() || !customer.mobile || !customer.province || !customer.city.trim() || !customer.address.trim() || !customer.postalCode) {
      setError('برای ثبت سفارش، همه فیلدهای ستاره‌دار را کامل کنید.');
      return;
    }
    if (!/^09\d{9}$/.test(customer.mobile)) {
      setError('شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.');
      return;
    }
    if (!/^\d{10}$/.test(customer.postalCode)) {
      setError('کد پستی باید ۱۰ رقم باشد.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.post('/orders', {
        customer,
        note,
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
      });
      setOrder(data.order);
      clear();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <div className="page">
        <div className="container order-confirm">
          <span className="order-confirm__icon">
            <CheckIcon size={26} />
          </span>
          <h1>سفارش شما ثبت شد</h1>
          <p>
            {order.customer.fullName} عزیز، سفارش شما با کد زیر در سیستم یاس اسپورت ثبت شد و توسط
            تیم پشتیبانی بررسی می‌شود.
          </p>
          <div className="order-code">
            <span>کد سفارش</span>
            <b>{order.code}</b>
          </div>
          <p style={{ marginTop: 20 }}>
            مبلغ نهایی سفارش: <b style={{ color: 'var(--ink)' }}>{formatPrice(order.total)}</b>
          </p>
          <p className="note">
            درگاه پرداخت آنلاین هنوز به فروشگاه متصل نیست؛ هیچ پرداختی در این مرحله انجام نشده است.
            برای هماهنگی پرداخت و ارسال، کارشناسان یاس اسپورت با شماره {faNum(order.customer.mobile)} تماس می‌گیرند.
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" className="btn btn-dark btn-sm">
              ادامه خرید
            </Link>
            <Link to="/account" className="btn btn-outline btn-sm">
              سفارش‌های من
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container page-block">
          <div className="empty-state">
            <strong>برای تسویه حساب، سبد خرید شما نباید خالی باشد.</strong>
            <div style={{ marginTop: 18 }}>
              <Link to="/shop" className="btn btn-dark btn-sm">
                مشاهده محصولات
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">خانه</Link>
          <span>/</span>
          <Link to="/cart">سبد خرید</Link>
          <span>/</span>
          <span style={{ opacity: 1, color: 'var(--ink)' }}>تسویه حساب</span>
        </div>

        <div className="page-head">
          <h1>تسویه حساب</h1>
          <p>اطلاعات گیرنده را کامل کنید تا سفارش شما ثبت شود. پرداخت در این مرحله انجام نمی‌شود.</p>
        </div>

        <div className="checkout-layout">
          <form className="panel checkout-form" onSubmit={submit} noValidate>
            <h2>اطلاعات گیرنده</h2>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="fullName">نام و نام خانوادگی *</label>
                <input
                  id="fullName"
                  value={form.fullName}
                  onChange={(event) => setField('fullName', event.target.value)}
                  placeholder="مثلاً سارا احمدی"
                />
              </div>
              <div className="field">
                <label htmlFor="mobile">شماره موبایل *</label>
                <input
                  id="mobile"
                  value={form.mobile}
                  onChange={(event) => setField('mobile', event.target.value)}
                  placeholder="09123456789"
                  inputMode="tel"
                  dir="ltr"
                />
              </div>
              <div className="field">
                <label htmlFor="province">استان *</label>
                <select
                  id="province"
                  value={form.province}
                  onChange={(event) => setField('province', event.target.value)}
                >
                  <option value="">انتخاب استان</option>
                  {PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="city">شهر *</label>
                <input
                  id="city"
                  value={form.city}
                  onChange={(event) => setField('city', event.target.value)}
                  placeholder="مثلاً تهران"
                />
              </div>
              <div className="field span-2">
                <label htmlFor="address">آدرس کامل *</label>
                <textarea
                  id="address"
                  value={form.address}
                  onChange={(event) => setField('address', event.target.value)}
                  placeholder="خیابان، کوچه، پلاک، واحد"
                />
              </div>
              <div className="field">
                <label htmlFor="postalCode">کد پستی *</label>
                <input
                  id="postalCode"
                  value={form.postalCode}
                  onChange={(event) => setField('postalCode', event.target.value)}
                  placeholder="۱۰ رقم"
                  inputMode="numeric"
                  dir="ltr"
                />
              </div>
              <div className="field">
                <label htmlFor="note">توضیحات سفارش</label>
                <input
                  id="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="اختیاری"
                />
              </div>
            </div>

            {error && <p className="form-alert">{error}</p>}

            <button type="submit" className="btn btn-dark" disabled={submitting}>
              {submitting ? 'در حال ثبت سفارش…' : 'ثبت نهایی سفارش'}
            </button>
            <p className="form-note">
              با ثبت سفارش، قوانین و مقررات فروشگاه یاس اسپورت را می‌پذیرید. پرداخت آنلاین در حال
              حاضر فعال نیست.
            </p>
          </form>

          <div className="panel">
            <h2>خلاصه سفارش</h2>
            {items.map((item) => (
              <div className="summary-row" key={`${item.productId}-${item.size}-${item.color}`}>
                <span>
                  {item.name} · {item.size} × {faNum(item.quantity)}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="summary-row" style={{ borderTop: '1px solid var(--line)', marginTop: 8, paddingTop: 14 }}>
              <span>هزینه ارسال</span>
              <span>{formatPrice(totals.shipping)}</span>
            </div>
            <div className="summary-row is-total">
              <span>مبلغ نهایی</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
            <div className="summary-actions">
              <Link to="/cart" className="btn btn-outline btn-block">
                ویرایش سبد خرید
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { faNum, formatPrice } from '../lib/format';
import { MinusIcon, PlusIcon, TrashIcon } from '../components/icons';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totals, itemKey } = useCart();

  useEffect(() => {
    document.title = 'سبد خرید | YAS SPORTS';
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">خانه</Link>
          <span>/</span>
          <span style={{ opacity: 1, color: 'var(--ink)' }}>سبد خرید</span>
        </div>

        <div className="page-head">
          <h1>سبد خرید</h1>
          <p>
            {items.length ? `${faNum(totals.count)} کالا در سبد خرید شما قرار دارد.` : 'سبد خرید شما در حال حاضر خالی است.'}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="empty-state" style={{ marginBottom: 64 }}>
            <strong>سبد خرید شما خالی است.</strong>
            محصولات کالکشن جدید را ببین و اولین انتخاب خودت را ثبت کن.
            <div style={{ marginTop: 20 }}>
              <Link to="/shop" className="btn btn-dark btn-sm">
                مشاهده محصولات
              </Link>
            </div>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="panel">
              <h2>کالاهای انتخاب‌شده</h2>
              {items.map((item) => {
                const key = itemKey(item);
                return (
                  <div className="cart-item" key={key}>
                    <Link to={`/product/${item.slug}`}>
                      <img src={item.image} alt={item.name} loading="lazy" />
                    </Link>
                    <div>
                      <h3>{item.name}</h3>
                      <div className="meta">
                        <span>سایز: {faNum(item.size)}</span>
                        {item.color ? <span>رنگ: {item.color}</span> : null}
                        <span>{item.nameEn}</span>
                      </div>
                      <div className="actions">
                        <div className="qty">
                          <button
                            type="button"
                            onClick={() => updateQuantity(key, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            aria-label="افزایش تعداد"
                          >
                            <PlusIcon />
                          </button>
                          <span>{faNum(item.quantity)}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(key, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="کاهش تعداد"
                          >
                            <MinusIcon />
                          </button>
                        </div>
                        <button type="button" className="remove" onClick={() => removeItem(key)}>
                          <TrashIcon size={14} /> حذف از سبد
                        </button>
                      </div>
                    </div>
                    <div className="cart-item__price">
                      <b>{formatPrice(item.price * item.quantity)}</b>
                      <small>{formatPrice(item.price)} / هر عدد</small>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="panel">
              <h2>خلاصه سفارش</h2>
              <div className="summary-row">
                <span>جمع کالاها ({faNum(totals.count)} عدد)</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>هزینه ارسال</span>
                <span>{formatPrice(totals.shipping)}</span>
              </div>
              <div className="summary-row is-total">
                <span>مبلغ قابل پرداخت</span>
                <span>{formatPrice(totals.total)}</span>
              </div>
              <div className="summary-actions">
                <Link to="/checkout" className="btn btn-dark btn-block">
                  ادامه و ثبت سفارش
                </Link>
                <Link to="/shop" className="btn btn-outline btn-block">
                  ادامه خرید
                </Link>
              </div>
              <p className="form-note" style={{ marginTop: 14 }}>
                هزینه ارسال برای همه سفارش‌ها ثابت و در مرحله بعدی قابل بررسی است.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

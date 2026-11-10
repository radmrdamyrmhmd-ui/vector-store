import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { faNum, formatPrice } from '../lib/format';
import { CloseIcon } from './icons';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, totals, itemKey } = useCart();
  const { pathname } = useLocation();

  useEffect(() => {
    closeCart();
  }, [pathname]);

  return (
    <div className={`drawer ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      <div className="drawer__backdrop" onClick={closeCart} />
      <aside className="drawer__panel" aria-label="سبد خرید">
        <div className="drawer__head">
          <h2>سبد خرید شما</h2>
          <button type="button" className="icon-btn" onClick={closeCart} aria-label="بستن سبد خرید">
            <CloseIcon />
          </button>
        </div>

        <div className="drawer__body">
          {items.length === 0 ? (
            <p className="drawer-empty">سبد خرید شما خالی است.</p>
          ) : (
            items.map((item) => {
              const key = itemKey(item);
              return (
                <div className="mini-item" key={key}>
                  <Link to={`/product/${item.slug}`} onClick={closeCart}>
                    <img src={item.image} alt={item.name} loading="lazy" />
                  </Link>
                  <div>
                    <h4>{item.name}</h4>
                    <p>
                      سایز {faNum(item.size)}
                      {item.color ? ` · ${item.color}` : ''} · {faNum(item.quantity)} عدد
                    </p>
                    <div className="price">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                  <button type="button" className="remove" onClick={() => removeItem(key)}>
                    حذف
                  </button>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer__foot">
            <div className="drawer-line">
              <span>جمع کالاها</span>
              <b>{formatPrice(totals.subtotal)}</b>
            </div>
            <div className="drawer-line">
              <span>هزینه ارسال</span>
              <b>{formatPrice(totals.shipping)}</b>
            </div>
            <div className="drawer-line" style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>
              <span style={{ fontWeight: 700 }}>مبلغ قابل پرداخت</span>
              <b>{formatPrice(totals.total)}</b>
            </div>
            <Link to="/cart" className="btn btn-dark btn-block" onClick={closeCart}>
              مشاهده سبد خرید
            </Link>
            <Link to="/checkout" className="btn btn-outline btn-block" onClick={closeCart}>
              ادامه فرایند خرید
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}

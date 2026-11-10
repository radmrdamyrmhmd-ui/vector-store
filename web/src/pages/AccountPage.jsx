import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { STATUS_LABELS, faNum, formatDate, formatPrice } from '../lib/format';

export default function AccountPage() {
  const { user, loading, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [name, setName] = useState(user?.name || '');
  const [profileStatus, setProfileStatus] = useState('');

  useEffect(() => {
    document.title = 'حساب کاربری | YAS SPORTS';
  }, []);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    api
      .get('/orders/mine')
      .then((data) => {
        if (active) setOrders(data.items || []);
      })
      .catch(() => {
        if (active) setOrders([]);
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="page">
        <div className="container page-block">
          <div className="empty-state">در حال بارگذاری حساب کاربری…</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: '/account' }} />;

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileStatus('');
    try {
      await api.patch('/auth/me', { name });
      await refresh();
      setProfileStatus('اطلاعات حساب به‌روزرسانی شد.');
    } catch (error) {
      setProfileStatus(error.message);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <h1>سلام {user.name}</h1>
          <p>از این صفحه سفارش‌های خود را پیگیری کن و اطلاعات حساب را ویرایش کن.</p>
        </div>

        <div className="account-grid">
          <aside className="account-side">
            <h3>{user.name}</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4, direction: 'ltr', textAlign: 'end' }}>
              {user.email}
            </p>
            <nav>
              <Link to="/account" className="is-active">
                سفارش‌های من
              </Link>
              <Link to="/cart">سبد خرید</Link>
              {user.role === 'admin' && <Link to="/admin">پنل مدیریت</Link>}
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
              >
                خروج از حساب
              </button>
            </nav>
          </aside>

          <div>
            <div className="panel" style={{ marginBottom: 18 }}>
              <h2>ویرایش اطلاعات</h2>
              <form onSubmit={saveProfile} className="form-grid">
                <div className="field">
                  <label htmlFor="account-name">نام و نام خانوادگی</label>
                  <input id="account-name" value={name} onChange={(event) => setName(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="account-email">ایمیل</label>
                  <input id="account-email" value={user.email} dir="ltr" disabled />
                </div>
                <div className="span-2" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button type="submit" className="btn btn-dark btn-sm">
                    ذخیره تغییرات
                  </button>
                  {profileStatus && <span className="form-note">{profileStatus}</span>}
                </div>
              </form>
            </div>

            <div className="panel">
              <h2>تاریخچه سفارش‌ها</h2>
              {ordersLoading ? (
                <p className="form-note">در حال بارگذاری سفارش‌ها…</p>
              ) : orders.length === 0 ? (
                <div className="empty-state" style={{ border: 0, background: 'transparent' }}>
                  <strong>هنوز سفارشی ثبت نکرده‌اید.</strong>
                  <div style={{ marginTop: 16 }}>
                    <Link to="/shop" className="btn btn-dark btn-sm">
                      مشاهده محصولات
                    </Link>
                  </div>
                </div>
              ) : (
                orders.map((order) => (
                  <article className="order-card" key={order.id}>
                    <div className="order-card__head">
                      <div>
                        <b>سفارش {order.code}</b>
                        <div className="order-card__meta" style={{ marginTop: 6 }}>
                          <span>{formatDate(order.createdAt)}</span>
                          <span>{faNum(order.items.length)} قلم کالا</span>
                        </div>
                      </div>
                      <span className={`status status--${order.status}`}>{STATUS_LABELS[order.status]}</span>
                    </div>
                    <ul>
                      {order.items.map((item) => (
                        <li key={`${order.id}-${item.slug}-${item.size}`}>
                          <span>
                            {item.name} · سایز {item.size} × {faNum(item.quantity)}
                          </span>
                          <span>{formatPrice(item.lineTotal)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="summary-row is-total" style={{ borderTop: '1px solid var(--line)' }}>
                      <span>مبلغ سفارش</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

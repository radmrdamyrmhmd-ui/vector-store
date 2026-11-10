import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { STATUS_LABELS, faNum, formatDate, formatPrice } from '../../lib/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    document.title = 'پنل مدیریت | YAS SPORTS';
    api.get('/admin/stats').then(setStats).catch(() => {});
    api
      .get('/admin/orders')
      .then((data) => setOrders((data.items || []).slice(0, 6)))
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>داشبورد فروشگاه</h1>
          <p>نمای کلی از وضعیت محصولات، سفارش‌ها و مشتریان یاس اسپورت.</p>
        </div>
        <Link to="/admin/products" className="btn btn-dark btn-sm">
          مدیریت محصولات
        </Link>
      </div>

      <div className="stats">
        <div className="stat-card">
          <span>تعداد محصولات</span>
          <b>{stats ? faNum(stats.products) : '—'}</b>
        </div>
        <div className="stat-card">
          <span>سفارش‌ها</span>
          <b>{stats ? faNum(stats.orders) : '—'}</b>
        </div>
        <div className="stat-card">
          <span>در انتظار بررسی</span>
          <b>{stats ? faNum(stats.pendingOrders) : '—'}</b>
        </div>
        <div className="stat-card">
          <span>مشتریان</span>
          <b>{stats ? faNum(stats.customers) : '—'}</b>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__head">
          <h2>آخرین سفارش‌ها</h2>
          <Link to="/admin/orders" className="link-arrow" style={{ fontSize: '0.78rem' }}>
            همه سفارش‌ها
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="admin-empty">هنوز سفارشی ثبت نشده است.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>کد سفارش</th>
                  <th>مشتری</th>
                  <th>مبلغ</th>
                  <th>وضعیت</th>
                  <th>تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ letterSpacing: '0.08em' }}>{order.code}</td>
                    <td>{order.customer?.fullName}</td>
                    <td>{formatPrice(order.total)}</td>
                    <td>
                      <span className={`status status--${order.status}`}>{STATUS_LABELS[order.status]}</span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

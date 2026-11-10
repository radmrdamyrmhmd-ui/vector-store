import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { STATUS_LABELS, faNum, formatDate, formatPrice } from '../../lib/format';

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/orders');
      setOrders(data.items || []);
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'مدیریت سفارش‌ها | YAS SPORTS';
    load();
  }, []);

  const changeStatus = async (order, status) => {
    try {
      const data = await api.patch(`/admin/orders/${order.id}`, { status });
      setOrders((prev) => prev.map((item) => (item.id === order.id ? data.order : item)));
    } catch (updateError) {
      window.alert(updateError.message);
    }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>مدیریت سفارش‌ها</h1>
          <p>بررسی سفارش‌های ثبت‌شده و تغییر وضعیت پردازش هر سفارش.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__head">
          <h2>فهرست سفارش‌ها ({faNum(orders.length)})</h2>
        </div>

        {error && <p className="form-alert">{error}</p>}

        {loading ? (
          <p className="admin-empty">در حال بارگذاری…</p>
        ) : orders.length === 0 ? (
          <p className="admin-empty">هنوز سفارشی ثبت نشده است.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>کد</th>
                  <th>مشتری</th>
                  <th>موبایل</th>
                  <th>مبلغ</th>
                  <th>وضعیت</th>
                  <th>تاریخ</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    expanded={expanded === order.id}
                    onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                    onStatusChange={(status) => changeStatus(order, status)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function OrderRow({ order, expanded, onToggle, onStatusChange }) {
  return (
    <>
      <tr>
        <td style={{ letterSpacing: '0.06em' }}>{order.code}</td>
        <td>{order.customer?.fullName}</td>
        <td dir="ltr" style={{ textAlign: 'end' }}>{order.customer?.mobile}</td>
        <td>{formatPrice(order.total)}</td>
        <td>
          <select
            className="admin-select"
            style={{ minWidth: 140 }}
            value={order.status}
            onChange={(event) => onStatusChange(event.target.value)}
            aria-label={`وضعیت سفارش ${order.code}`}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </td>
        <td>{formatDate(order.createdAt)}</td>
        <td>
          <button type="button" className="chip" onClick={onToggle}>
            {expanded ? 'بستن' : 'جزئیات'}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} style={{ background: '#fafafa' }}>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--muted)' }}>
                <span>گیرنده: {order.customer?.fullName}</span>
                <span>
                  نشانی: {order.customer?.province}، {order.customer?.city}، {order.customer?.address}
                </span>
                <span>کد پستی: {order.customer?.postalCode}</span>
              </div>
              <ul style={{ display: 'grid', gap: 6 }}>
                {order.items.map((item) => (
                  <li key={`${item.slug}-${item.size}`} style={{ display: 'flex', gap: 12, fontSize: '0.8rem' }}>
                    <img src={item.image} alt="" style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover' }} />
                    <span>
                      {item.name} · سایز {item.size}
                      {item.color ? ` · ${item.color}` : ''} × {faNum(item.quantity)}
                    </span>
                    <span style={{ marginInlineStart: 'auto' }}>{formatPrice(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              {order.note && <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>یادداشت مشتری: {order.note}</p>}
              <p style={{ fontSize: '0.8rem' }}>
                جمع کالاها: {formatPrice(order.subtotal)} · ارسال: {formatPrice(order.shipping)} · مبلغ نهایی:{' '}
                <b>{formatPrice(order.total)}</b>
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

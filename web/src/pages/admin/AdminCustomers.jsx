import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { faNum, formatDate, formatPrice } from '../../lib/format';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'مشتریان | YAS SPORTS';
    api
      .get('/admin/customers')
      .then((data) => setCustomers(data.items || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>مشتریان</h1>
          <p>فهرست کاربران ثبت‌نام‌شده و تعداد سفارش‌های هر مشتری.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__head">
          <h2>فهرست مشتریان ({faNum(customers.length)})</h2>
        </div>

        {loading ? (
          <p className="admin-empty">در حال بارگذاری…</p>
        ) : customers.length === 0 ? (
          <p className="admin-empty">هنوز مشتری ثبت‌نام‌شده‌ای وجود ندارد.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>نام</th>
                  <th>ایمیل</th>
                  <th>تعداد سفارش</th>
                  <th>مجموع خرید</th>
                  <th>تاریخ عضویت</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td dir="ltr" style={{ textAlign: 'end' }}>{customer.email}</td>
                    <td>{faNum(customer.ordersCount)}</td>
                    <td>{formatPrice(customer.totalSpent)}</td>
                    <td>{formatDate(customer.createdAt)}</td>
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

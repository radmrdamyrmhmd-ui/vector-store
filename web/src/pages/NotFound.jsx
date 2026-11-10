import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <div className="container page-block">
        <div className="empty-state" style={{ padding: '80px 24px' }}>
          <strong style={{ fontSize: '2rem' }}>۴۰۴</strong>
          صفحه‌ای که به دنبال آن هستید پیدا نشد.
          <div style={{ marginTop: 22, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-dark btn-sm">
              صفحه اصلی
            </Link>
            <Link to="/shop" className="btn btn-outline btn-sm">
              فروشگاه
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

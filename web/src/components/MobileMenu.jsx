import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandMark from './BrandMark';
import { CloseIcon } from './icons';

export default function MobileMenu({ open, onClose, items }) {
  const { user, logout } = useAuth();

  return (
    <div className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="mobile-menu__backdrop" onClick={onClose} />
      <div className="mobile-menu__panel">
        <div className="mobile-menu__top">
          <Link to="/" className="brand" onClick={onClose}>
            <BrandMark />
            <span className="brand-name">
              <b>YAS</b>
              <span>SPORTS</span>
            </span>
          </Link>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="بستن منو">
            <CloseIcon />
          </button>
        </div>

        <nav className="mobile-menu__links" aria-label="منوی موبایل">
          {items.map((item) => (
            <Link key={item.to} to={item.to} onClick={onClose}>
              {item.label}
              <span>↗</span>
            </Link>
          ))}
        </nav>

        <div className="mobile-menu__links">
          {user ? (
            <>
              <Link to="/account" onClick={onClose}>
                حساب کاربری من
                <span>↗</span>
              </Link>
              <Link to="/account" onClick={onClose}>
                سفارش‌های من
                <span>↗</span>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={onClose}>
                  پنل مدیریت
                  <span>↗</span>
                </Link>
              )}
              <button type="button" onClick={() => { logout(); onClose(); }} style={{ textAlign: 'start', paddingBlock: 17, borderBottom: '1px solid var(--line)', fontSize: '1.05rem', fontWeight: 600 }}>
                خروج از حساب
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={onClose}>
                ورود به حساب
                <span>↗</span>
              </Link>
              <Link to="/register" onClick={onClose}>
                ساخت حساب جدید
                <span>↗</span>
              </Link>
            </>
          )}
        </div>

        <p style={{ marginTop: 'auto', fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 2 }}>
          YAS SPORTS — پشتیبانی: ۰۲۱-۹۱۰۰۰۰۰۰
        </p>
      </div>
    </div>
  );
}

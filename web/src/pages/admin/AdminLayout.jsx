import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandMark from '../../components/BrandMark';
import { LogoutIcon } from '../../components/icons';

const LINKS = [
  { to: '/admin', label: 'داشبورد', end: true },
  { to: '/admin/products', label: 'محصولات' },
  { to: '/admin/orders', label: 'سفارش‌ها' },
  { to: '/admin/categories', label: 'دسته‌بندی‌ها' },
  { to: '/admin/customers', label: 'مشتریان' },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="admin-shell" style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>در حال بارگذاری…</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link to="/" className="brand">
          <BrandMark />
          <span className="brand-name">
            <b>YAS</b>
            <span>SPORTS</span>
          </span>
        </Link>

        <nav className="admin-nav">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-side__foot">
          <span>{user.name}</span>
          <Link to="/">مشاهده فروشگاه ↗</Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <LogoutIcon /> خروج از حساب
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

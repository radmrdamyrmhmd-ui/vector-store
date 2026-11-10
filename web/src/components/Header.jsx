import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import BrandMark from './BrandMark';
import MobileMenu from './MobileMenu';
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from './icons';
import { faNum } from '../lib/format';

const NAV = [
  { label: 'مردانه', to: '/shop?gender=male' },
  { label: 'زنانه', to: '/shop?gender=female' },
  { label: 'کفش ورزشی', to: '/shop' },
  { label: 'پوشاک', to: '/shop?category=apparel' },
  { label: 'کالکشن‌ها', to: '/shop?sort=newest' },
  { label: 'درباره ما', to: '/info/about' },
  { label: 'تماس با ما', to: '/contact' },
];

export default function Header() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { totals, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);

  const isHome = pathname === '/';
  const solid = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', onKey);
    searchRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    setSearchOpen(false);
    navigate(value ? `/shop?q=${encodeURIComponent(value)}` : '/shop');
  };

  const currentPath = `${pathname}${search}`;

  return (
    <>
      <header className={`site-header ${solid ? 'is-solid' : ''}`}>
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="YAS SPORTS — صفحه اصلی">
            <BrandMark />
            <span className="brand-name">
              <b>YAS</b>
              <span>SPORTS</span>
            </span>
          </Link>

          <nav className="main-nav" aria-label="منوی اصلی">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={currentPath === item.to ? 'active' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="جست‌وجو"
              onClick={() => setSearchOpen((open) => !open)}
            >
              <SearchIcon />
            </button>
            <Link
              to={user ? '/account' : '/login'}
              className="icon-btn"
              aria-label={user ? 'حساب کاربری' : 'ورود به حساب'}
            >
              <UserIcon />
            </Link>
            <button type="button" className="cart-btn" onClick={openCart} aria-label="سبد خرید">
              <BagIcon size={16} />
              <span className="cart-label">سبد خرید</span>
              <span className="count">({faNum(totals.count)})</span>
            </button>
            <button
              type="button"
              className="icon-btn hamburger"
              aria-label="منو"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="search-overlay">
            <form className="search-overlay__inner" onSubmit={submitSearch}>
              <div className="search-field">
                <SearchIcon size={22} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="نام محصول، دسته‌بندی یا کالکشن را جست‌وجو کنید"
                  aria-label="جست‌وجوی محصولات"
                />
              </div>
              <button type="button" className="icon-btn" onClick={() => setSearchOpen(false)} aria-label="بستن جست‌وجو">
                <CloseIcon />
              </button>
            </form>
          </div>
        )}
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} items={NAV} />
    </>
  );
}

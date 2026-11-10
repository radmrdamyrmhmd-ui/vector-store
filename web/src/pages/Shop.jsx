import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { CATEGORY_LABELS, faNum, formatNumber } from '../lib/format';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';

const SORT_OPTIONS = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price-asc', label: 'ارزان‌ترین' },
  { value: 'price-desc', label: 'گران‌ترین' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const gender = params.get('gender') || 'all';
  const q = params.get('q') || '';
  const min = params.get('min') || '';
  const max = params.get('max') || '';
  const size = params.get('size') || '';
  const color = params.get('color') || '';
  const sort = params.get('sort') || 'newest';

  const [filters, setFilters] = useState({ categories: [], priceRange: { min: 0, max: 0 }, sizes: [], colors: [] });
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceDraft, setPriceDraft] = useState({ min, max });

  useEffect(() => {
    document.title = 'فروشگاه | YAS SPORTS';
  }, []);

  useEffect(() => {
    api
      .get('/products/filters')
      .then((data) => setFilters(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPriceDraft({ min, max });
  }, [min, max]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const search = new URLSearchParams();
    if (category) search.set('category', category);
    if (gender && gender !== 'all') search.set('gender', gender);
    if (q) search.set('q', q);
    if (min) search.set('min', min);
    if (max) search.set('max', max);
    if (size) search.set('size', size);
    if (color) search.set('color', color);
    search.set('sort', sort);

    api
      .get(`/products?${search.toString()}`)
      .then((data) => {
        if (!active) return;
        setProducts(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(() => {
        if (active) {
          setProducts([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category, gender, q, min, max, size, color, sort]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const applyPrice = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(params);
    const minValue = priceDraft.min ? String(Number(priceDraft.min)) : '';
    const maxValue = priceDraft.max ? String(Number(priceDraft.max)) : '';
    if (minValue) next.set('min', minValue);
    else next.delete('min');
    if (maxValue) next.set('max', maxValue);
    else next.delete('max');
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    setParams(next, { replace: true });
  };

  const activeCount = useMemo(
    () => [category, gender !== 'all' ? gender : '', min, max, size, color].filter(Boolean).length,
    [category, gender, min, max, size, color],
  );

  const heading = category ? CATEGORY_LABELS[category] || 'فروشگاه' : gender !== 'all' ? 'کالکشن ' + (gender === 'male' ? 'مردانه' : 'زنانه') : 'همه محصولات';

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">خانه</Link>
          <span>/</span>
          <span style={{ opacity: 1, color: 'var(--ink)' }}>فروشگاه</span>
        </div>

        <div className="page-head">
          <h1>{q ? `نتایج جست‌وجو برای «${q}»` : heading}</h1>
          <p>
            کفش‌ها و پوشاک ورزشی یاس اسپورت با تمرکز بر راحتی، دوام و طراحی مینیمال. با فیلترها
            گزینه مناسب سبک خودت را پیدا کن.
          </p>
        </div>

        <div className="shop">
          <aside className={`filters ${filtersOpen ? 'is-open' : ''}`} aria-label="فیلترها">
            <div className="filter-group">
              <h3>دسته‌بندی</h3>
              <ul className="filter-list">
                <li>
                  <button
                    type="button"
                    className={!category ? 'is-active' : ''}
                    onClick={() => updateParam('category', '')}
                  >
                    همه محصولات
                  </button>
                </li>
                {filters.categories?.map((item) => (
                  <li key={item.slug}>
                    <button
                      type="button"
                      className={category === item.slug ? 'is-active' : ''}
                      onClick={() => updateParam('category', item.slug)}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-group">
              <h3>جنسیت</h3>
              <div className="chips">
                {[
                  { value: 'all', label: 'همه' },
                  { value: 'male', label: 'مردانه' },
                  { value: 'female', label: 'زنانه' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`chip ${gender === item.value ? 'is-active' : ''}`}
                    onClick={() => updateParam('gender', item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3>محدوده قیمت (تومان)</h3>
              <form className="price-row" onSubmit={applyPrice}>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="از"
                  value={priceDraft.min}
                  onChange={(event) => setPriceDraft((prev) => ({ ...prev, min: event.target.value }))}
                  aria-label="حداقل قیمت"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="تا"
                  value={priceDraft.max}
                  onChange={(event) => setPriceDraft((prev) => ({ ...prev, max: event.target.value }))}
                  aria-label="حداکثر قیمت"
                />
                <button type="submit" className="chip" aria-label="اعمال محدوده قیمت">
                  اعمال
                </button>
              </form>
              {filters.priceRange ? (
                <p className="form-note" style={{ marginTop: 8 }}>
                  از {formatNumber(filters.priceRange.min)} تا {formatNumber(filters.priceRange.max)} تومان
                </p>
              ) : null}
            </div>

            <div className="filter-group">
              <h3>سایز</h3>
              <div className="chips">
                {filters.sizes?.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`chip ${size === item ? 'is-active' : ''}`}
                    onClick={() => updateParam('size', size === item ? '' : item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3>رنگ</h3>
              <div className="chips">
                {filters.colors?.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`chip ${color === item ? 'is-active' : ''}`}
                    onClick={() => updateParam('color', color === item ? '' : item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {activeCount > 0 && (
              <div className="filter-group">
                <button type="button" className="link-arrow" onClick={clearAll}>
                  حذف همه فیلترها
                </button>
              </div>
            )}
          </aside>

          <div>
            <div className="shop-toolbar">
              <span className="result-count">
                <b>{faNum(total)}</b> محصول یافت شد
              </span>
              <div className="toolbar-right">
                <button
                  type="button"
                  className="chip filter-toggle"
                  onClick={() => setFiltersOpen((open) => !open)}
                >
                  {filtersOpen ? 'بستن فیلترها' : `فیلترها${activeCount ? ` (${faNum(activeCount)})` : ''}`}
                </button>
                <select
                  className="sort-select"
                  value={sort}
                  onChange={(event) => updateParam('sort', event.target.value)}
                  aria-label="مرتب‌سازی محصولات"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="product-grid shop-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="product-card" aria-hidden="true" style={{ minHeight: 320 }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <strong>محصولی با این مشخصات پیدا نشد.</strong>
                فیلترها را تغییر دهید یا عبارت دیگری جست‌وجو کنید.
              </div>
            ) : (
              <div className="product-grid shop-grid">
                {products.map((product, index) => (
                  <Reveal key={product.id} delay={Math.min(index * 60, 240)}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

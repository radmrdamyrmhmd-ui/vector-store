import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { CATEGORY_LABELS, faNum, formatPrice, formatNumber } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import { MinusIcon, PlusIcon, ShieldIcon, TruckIcon, RefreshIcon, BagIcon } from '../components/icons';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { show } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then((payload) => {
        if (!active) return;
        setData(payload);
        setActiveImage(0);
        setSize('');
        setColor(payload.product.colors?.[0] || '');
        setQuantity(1);
        setSizeError(false);
        document.title = `${payload.product.nameFa} | YAS SPORTS`;
      })
      .catch(() => {
        if (active) setData(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const product = data?.product;
  const related = data?.related || [];
  const imageList = useMemo(() => (product?.images?.length ? product.images : ['']), [product]);
  const maxQuantity = Math.min(product?.stock || 1, 10);

  if (loading) {
    return (
      <div className="page">
        <div className="container page-block">
          <div className="empty-state">در حال بارگذاری محصول…</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page">
        <div className="container page-block">
          <div className="empty-state">
            <strong>این محصول پیدا نشد.</strong>
            ممکن است حذف شده باشد یا نشانی آن تغییر کرده باشد.
            <div style={{ marginTop: 18 }}>
              <Link to="/shop" className="btn btn-dark btn-sm">
                بازگشت به فروشگاه
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    if (!size) {
      setSizeError(true);
      show('برای افزودن به سبد خرید، ابتدا سایز را انتخاب کنید.');
      return;
    }
    setSizeError(false);
    addItem(product, size, color, quantity);
    show(`${product.nameFa} به سبد خرید اضافه شد.`);
  };

  const buyNow = () => {
    if (!size) {
      setSizeError(true);
      show('برای ادامه خرید، ابتدا سایز را انتخاب کنید.');
      return;
    }
    addItem(product, size, color, quantity);
    navigate('/checkout');
  };

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">خانه</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`}>{CATEGORY_LABELS[product.category] || 'فروشگاه'}</Link>
          <span>/</span>
          <span style={{ opacity: 1, color: 'var(--ink)' }}>{product.nameFa}</span>
        </div>

        <div className="page-block product-detail">
          <div>
            <div className="gallery__main">
              <img src={imageList[activeImage]} alt={product.nameFa} />
            </div>
            {imageList.length > 1 && (
              <div className="gallery__thumbs">
                {imageList.map((image, index) => (
                  <button
                    key={image + index}
                    type="button"
                    className={index === activeImage ? 'is-active' : ''}
                    onClick={() => setActiveImage(index)}
                    aria-label={`تصویر ${faNum(index + 1)}`}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="product-info__name-en">{product.nameEn}</p>
            <h1>{product.nameFa}</h1>
            <div className="product-info__price">
              <b>{formatPrice(product.price)}</b>
              {product.oldPrice ? <del>{formatPrice(product.oldPrice)}</del> : null}
            </div>
            <p className="product-info__desc">{product.description}</p>
            <p className="product-info__desc" style={{ marginTop: 10, color: 'var(--muted)', fontSize: '0.82rem' }}>
              دسته‌بندی: {CATEGORY_LABELS[product.category] || product.category} · کد محصول: {product.nameEn.replace(/\s+/g, '-')}
            </p>

            <div className="option-block">
              <div className="option-block__head">
                <h3>انتخاب سایز</h3>
                <Link to="/info/sizing" style={{ fontSize: '0.74rem', color: 'var(--muted)', textDecoration: 'underline' }}>
                  راهنمای سایز
                </Link>
              </div>
              <div className="size-grid">
                {product.sizes?.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`size-option ${size === item ? 'is-active' : ''}`}
                    onClick={() => {
                      setSize(item);
                      setSizeError(false);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {sizeError && <p className="size-note">برای افزودن به سبد خرید، سایز مورد نظر را انتخاب کنید.</p>}
            </div>

            {product.colors?.length > 0 && (
              <div className="option-block">
                <div className="option-block__head">
                  <h3>رنگ</h3>
                  <span>{color}</span>
                </div>
                <div className="chips">
                  {product.colors.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`chip ${color === item ? 'is-active' : ''}`}
                      onClick={() => setColor(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="option-block">
              <div className="option-block__head">
                <h3>تعداد</h3>
              </div>
              <div className="qty">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.min(value + 1, maxQuantity))}
                  disabled={quantity >= maxQuantity}
                  aria-label="افزایش تعداد"
                >
                  <PlusIcon />
                </button>
                <span>{faNum(quantity)}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  disabled={quantity <= 1}
                  aria-label="کاهش تعداد"
                >
                  <MinusIcon />
                </button>
              </div>
            </div>

            <div className="buy-row">
              <button type="button" className="btn btn-dark" onClick={handleAdd} disabled={product.stock === 0}>
                <BagIcon size={17} />
                {product.stock === 0 ? 'ناموجود' : 'افزودن به سبد خرید'}
              </button>
              <button type="button" className="btn btn-outline" onClick={buyNow} disabled={product.stock === 0}>
                خرید سریع
              </button>
            </div>

            <p className="stock-line">
              <span className={`stock-dot ${product.stock <= 5 ? 'is-low' : ''}`} />
              {product.stock === 0
                ? 'این محصول فعلاً موجود نیست.'
                : product.stock <= 5
                  ? `تنها ${faNum(product.stock)} عدد در انبار باقی مانده است.`
                  : `موجود در انبار — ${formatNumber(product.stock)} عدد`}
            </p>

            <ul className="assurance">
              <li>
                <TruckIcon size={19} />
                ارسال سریع تهران و شهرستان‌ها
              </li>
              <li>
                <ShieldIcon size={19} />
                ضمانت اصالت کالا و کیفیت متریال
              </li>
              <li>
                <RefreshIcon size={19} />
                امکان تعویض سایز مطابق قوانین فروشگاه
              </li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal className="section-head">
              <div className="section-head__text">
                <p className="eyebrow">Related</p>
                <h2 className="section-title" style={{ marginTop: 16, fontSize: 'clamp(1.5rem, 2.6vw, 2.2rem)' }}>
                  محصولات مرتبط
                </h2>
              </div>
              <Link to={`/shop?category=${product.category}`} className="link-arrow">
                همه محصولات این دسته
              </Link>
            </Reveal>
            <div className="product-row">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

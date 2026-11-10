import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import ProductCard from '../ProductCard';
import Reveal from '../Reveal';
import { ArrowUpRight } from '../icons';

export default function CollectionSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get('/products?limit=3&sort=popular')
      .then((data) => {
        if (active) setProducts(data.items || []);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="section" id="collection">
      <div className="container">
        <Reveal className="section-head">
          <div className="section-head__text">
            <p className="eyebrow">New Collection</p>
            <h2 className="section-title" style={{ marginTop: 18 }}>
              کالکشن جدید
              <br />
              برای ریتم زندگی تو
            </h2>
            <p className="section-sub">
              جدیدترین مدل‌های کفش ورزشی برای دویدن، تمرین و استایل روزمره. انتخاب کن، حرکت کن و
              همیشه یک قدم جلوتر باش.
            </p>
          </div>
          <Link to="/shop" className="link-arrow">
            مشاهده همه محصولات
            <ArrowUpRight size={15} />
          </Link>
        </Reveal>

        <div className="product-grid">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="product-card"
                  aria-hidden="true"
                  style={{ minHeight: 320, background: 'var(--white)' }}
                />
              ))
            : products.map((product, index) => (
                <Reveal key={product.id} delay={index * 90}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  );
}

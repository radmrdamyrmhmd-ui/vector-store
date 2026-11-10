import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/format';
import { ArrowUpRight } from './icons';

export default function ProductCard({ product }) {
  const image = (product.images || [])[0] || '/images/product-runner-pro.jpg';
  return (
    <article className="product-card">
      <Link to={`/product/${product.slug}`} className="product-card__media" aria-label={product.nameFa}>
        <img src={image} alt={product.nameFa} loading="lazy" />
        {product.isNew && <span className="product-card__badge">جدید</span>}
      </Link>
      <div className="product-card__body">
        <div>
          <h3 className="product-card__title">{product.nameFa}</h3>
          <p className="product-card__sub">{product.nameEn}</p>
          <div className="product-card__price">
            {formatPrice(product.price)}
            {product.oldPrice ? <del>{formatPrice(product.oldPrice)}</del> : null}
          </div>
        </div>
        <Link to={`/product/${product.slug}`} className="product-card__arrow" aria-label={`جزئیات ${product.nameFa}`}>
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}

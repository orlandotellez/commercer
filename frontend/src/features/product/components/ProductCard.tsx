'use client';

import Link from 'next/link';
import { Product } from '@/shared/types';
import { useCart } from '@/features/cart/context/CartContext';
import { ShoppingCart, Star } from 'lucide-react';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  const discount = product.originalPrice
    ? Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    )
    : 0;

  const stockStatus =
    product.stock > 10 ? 'in' : product.stock > 0 ? 'low' : 'out';

  return (
    <div className={styles.card}>

      <Link href={`/product/${product.slug}`} className={styles.imageLink}>
        <div className={styles.imageWrapper}>
          <img
            src={product.image}
            alt={product.name}
            className={styles.image}
            loading="lazy"
          />

          {discount > 0 && (
            <span className={styles.discount}>-{discount}%</span>
          )}
        </div>
      </Link>

      <div className={styles.content}>

        <p className={styles.brand}>{product.brand}</p>

        <Link href={`/product/${product.slug}`}>
          <h3 className={styles.title}>{product.name}</h3>
        </Link>

        <div className={styles.rating}>
          <Star size={12} className={styles.star} />
          <span>
            {product.rating} ({product.reviews})
          </span>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.price}>
            ${product.price.toFixed(2)}
          </span>

          {product.originalPrice && (
            <span className={styles.oldPrice}>
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className={styles.footer}>
          <span
            className={
              stockStatus === 'in'
                ? styles.stockIn
                : stockStatus === 'low'
                  ? styles.stockLow
                  : styles.stockOut
            }
          >
            {stockStatus === 'in'
              ? 'En Stock'
              : stockStatus === 'low'
                ? `Quedan ${product.stock}`
                : 'Agotado'}
          </span>

          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            disabled={product.stock === 0}
            className={styles.cartBtn}
          >
            <ShoppingCart size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};


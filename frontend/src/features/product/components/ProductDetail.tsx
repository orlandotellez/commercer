import { Star, ShoppingCart, Minus, Plus } from 'lucide-react';
import styles from "./ProductDetail.module.css"
import { Product } from '@/shared/types';

type StockStatus = "in" | "low" | "out"

interface ProductDetailProps {
  product: Product
  discount: number
  stockStatus: StockStatus
  qty: number
  setQty: (qty: number) => void
  addItem: (product: Product, qty: number) => void
}

export const ProductDetail = ({
  product,
  discount,
  stockStatus,
  qty,
  setQty,
  addItem
}: ProductDetailProps) => {
  return (
    <>
      <div className={styles.mainGrid}>
        {/* Image */}
        <div className={styles.imageBox}>
          <img
            src={product.images[0]}
            alt={product.name}
            className={styles.image}
          />
        </div>

        {/* Info */}
        <div className={styles.info}>
          <p className={styles.brand}>{product.brand}</p>

          <h1 className={styles.title}>{product.name}</h1>

          {/* Rating */}
          <div className={styles.rating}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.floor(product.rating)
                    ? styles.starFilled
                    : styles.starEmpty
                }
              />
            ))}
            <span>
              {product.rating} ({product.reviews} reseñas)
            </span>
          </div>

          {/* Price */}
          <div className={styles.priceRow}>
            <span className={styles.price}>
              ${product.price.toFixed(2)}
            </span>

            {product.originalPrice && (
              <>
                <span className={styles.oldPrice}>
                  ${product.originalPrice.toFixed(2)}
                </span>
                <span className={styles.discount}>
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {/* Stock */}
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
                ? `Solo quedan ${product.stock}`
                : 'Agotado'}
          </span>

          <p className={styles.description}>
            {product.description}
          </p>

          {/* Quantity */}
          <div className={styles.cartRow}>
            <div className={styles.qtyBox}>
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                <Minus size={14} />
              </button>

              <span>{qty}</span>

              <button
                onClick={() =>
                  setQty(Math.min(product.stock, qty + 1))
                }
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={() => addItem(product, qty)}
              disabled={product.stock === 0}
              className={styles.addBtn}
            >
              <ShoppingCart size={18} />
              Agregar al Carrito
            </button>
          </div>

          {/* Specs */}
          <div className={styles.specs}>
            <h3>Especificaciones Técnicas</h3>

            <table>
              <tbody>
                {Object.entries(product.specs).map(([key, value]) => (
                  <tr key={key}>
                    <td className={styles.specKey}>{key}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </>
  )
}


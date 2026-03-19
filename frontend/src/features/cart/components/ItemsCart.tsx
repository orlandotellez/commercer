import { CartItem } from "@/shared/types"
import styles from "./ItemsCart.module.css"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"

interface ItemsCartProps {
  items: CartItem[]
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
}

export const ItemsCart = ({ items, updateQuantity, removeItem }: ItemsCartProps) => {
  return (
    <>
      <div className={styles.items}>
        {items.map(({ product, quantity }) => (
          <div key={product.id} className={styles.card}>

            <Link href={`/product/${product.slug}`}>
              <img
                src={product.image}
                alt={product.name}
                className={styles.image}
              />
            </Link>

            <div className={styles.info}>
              <Link href={`/product/${product.slug}`} className={styles.name}>
                {product.name}
              </Link>

              <p className={styles.brand}>{product.brand}</p>

              <div className={styles.row}>

                {/* Quantity */}
                <div className={styles.qtyBox}>
                  <button
                    onClick={() =>
                      updateQuantity(product.id, quantity - 1)
                    }
                  >
                    <Minus size={12} />
                  </button>

                  <span>{quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(product.id, quantity + 1)
                    }
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Price + Delete */}
                <div className={styles.actions}>
                  <span className={styles.price}>
                    ${(product.price * quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeItem(product.id)}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

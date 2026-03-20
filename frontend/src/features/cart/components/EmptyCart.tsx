import Link from "next/link"
import styles from "./EmptyCart.module.css"
import { ArrowRight, ShoppingCart } from "lucide-react"

export const EmptyCart = () => {
  return (
    <div className={styles.empty}>
      <ShoppingCart className={styles.icon} strokeWidth={1.5} />
      <h1 className={styles.title}>Tu carrito está vacío</h1>
      <p className={styles.description}>Agrega productos para comenzar</p>

      <Link href="/shop" className={styles.shopBtn}>
        Ir a la Tienda <ArrowRight size={16} />
      </Link>
    </div>
  )
}


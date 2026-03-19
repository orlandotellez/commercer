import Link from "next/link"
import styles from "./EmptyCart.module.css"
import { ArrowRight } from "lucide-react"

export const EmptyCart = () => {
  return (
    <>
      <div className={styles.empty}>
        <h1>Tu carrito está vacío</h1>
        <p>Agrega productos para comenzar</p>

        <Link href="/shop" className={styles.shopBtn}>
          Ir a la Tienda <ArrowRight size={16} />
        </Link>
      </div>
    </>
  )
}


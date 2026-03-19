import Link from "next/link"
import styles from "./ProductNotFound.module.css"

export const ProductNotFound = () => {
  return (
    <>
      <div className={styles.notFound}>
        <h1>Producto no encontrado</h1>
        <Link href="/shop">Volver a la tienda</Link>
      </div>
    </>
  )
}

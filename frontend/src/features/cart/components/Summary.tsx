import Link from "next/link"
import styles from "./Summary.module.css"

interface SummaryProps {
  subtotal: number
  tax: number
  total: number
}

export const Summary = ({ subtotal, tax, total }: SummaryProps) => {
  return (
    <>
      <div className={styles.summary}>
        <h3>Resumen del Pedido</h3>

        <div className={styles.summaryBox}>
          <div>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div>
            <span>IVA (15%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div>
            <span>Envío</span>
            <span className={styles.free}>Gratis</span>
          </div>

          <div className={styles.total}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <Link href="/checkout" className={styles.checkoutBtn}>
          Proceder al Pago
        </Link>
      </div>
    </>
  )
}

import { Download } from "lucide-react"
import styles from "./Header.module.css"

export const Header = () => {
  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Pedidos</h1>
          <p className={styles.pageSubtitle}>
            Gestiona todos los pedidos de tu tienda
          </p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.exportButton}>
            <Download className={styles.exportIcon} />
            Exportar
          </button>
        </div>
      </div>
    </>
  )
}

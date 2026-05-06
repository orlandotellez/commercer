import styles from "./Header.module.css"

export const Header = () => {
  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Ventas</h1>
          <p className={styles.pageSubtitle}>
            Resumen de ventas totales, completadas y pendientes
          </p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.lastUpdateLabel}>Última actualización:</span>
          <span className={styles.lastUpdateValue}>
            {new Date().toLocaleString("es-AR")}
          </span>
        </div>
      </div>

    </>
  )
}


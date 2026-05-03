import styles from "./ResultsInfo.module.css"

interface ResultsInfoProps {
  orders: number
  currentPage: number
  totalPages: number
}

export const ResultsInfo = ({ orders, totalPages, currentPage }: ResultsInfoProps) => {
  return (
    <>
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          {orders} pedidos encontrados
        </span>
        {totalPages > 1 && (
          <span className={styles.resultsPage}>
            Página {currentPage} de {totalPages}
          </span>
        )}
      </div>
    </>
  )
}

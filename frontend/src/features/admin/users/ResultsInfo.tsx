import styles from "./ResultsInfo.module.css"

interface ResultsInfoProps {
  totalCount: number
  activeFiltersCount: number
  currentPage: number
  totalPages: number
}

export const ResultsInfo = ({ totalCount, activeFiltersCount, currentPage, totalPages }: ResultsInfoProps) => {
  return (
    <>
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          {totalCount} usuarios encontrados
        </span>
        {activeFiltersCount > 0 && (
          <span className={styles.resultsPage}>
            Página {currentPage} de {totalPages}
          </span>
        )}
      </div>

    </>
  )
}


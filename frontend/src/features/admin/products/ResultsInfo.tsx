import styles from "./ResultsInfo.module.css";

interface ResultsInfoProps {
  filteredCount: number;
  totalPages: number;
  currentPage: number;
  activeFiltersCount: number;
}

export const ResultsInfo = ({ 
  filteredCount, 
  totalPages, 
  currentPage, 
  activeFiltersCount 
}: ResultsInfoProps) => {
  return (
    <div className={styles.resultsInfo}>
      <span className={styles.resultsCount}>
        {filteredCount} productos encontrados
      </span>
      {activeFiltersCount > 0 && (
        <span className={styles.resultsPage}>
          Página {currentPage} de {totalPages}
        </span>
      )}
    </div>
  );
};

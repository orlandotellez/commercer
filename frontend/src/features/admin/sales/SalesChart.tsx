import styles from "./SalesChart.module.css"

type TimeFilter = "day" | "week" | "month"

interface SalesDataItem {
  label: string
  value: number
}
interface SalesChartProps {
  salesData: SalesDataItem[]
  loadingChart: boolean
  timeFilter: TimeFilter
  setTimeFilter: (filter: TimeFilter) => void
  fetchChartData: (filter: TimeFilter) => void
  totalSales: number
  averageSales: number
  maxSales: number
  filterLabels: Record<TimeFilter, string>
}

export const SalesChart = ({
  salesData,
  loadingChart,
  timeFilter,
  setTimeFilter,
  fetchChartData,
  totalSales,
  averageSales,
  maxSales,
  filterLabels,
}: SalesChartProps) => {
  return (
    <>
      <div className={styles.salesChart}>
        <div className={styles.chartHeader}>
          <h2 className={styles.chartTitle}>Gráfico de Ventas</h2>
          <div className={styles.filterButtons}>
            {(["day", "week", "month"] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                className={`${styles.filterButton} ${timeFilter === filter ? styles.filterButtonActive : ""}`}
                onClick={() => {
                  setTimeFilter(filter);
                  fetchChartData(filter);
                }}
              >
                {filterLabels[filter]}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.chartBars}>
          {loadingChart ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <p>Cargando gráfica...</p>
            </div>
          ) : salesData.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <p>No hay datos para mostrar</p>
            </div>
          ) : (
            salesData.map((item, index) => (
              <div key={index} className={styles.chartBarWrapper}>
                <div
                  className={styles.chartBar}
                  style={{
                    height: `${maxSales > 0 ? (item.value / maxSales) * 100 : 0}%`,
                  }}
                >
                  <div className={styles.chartBarTooltip}>
                    ${item.value.toLocaleString()}
                  </div>
                </div>
                <span className={styles.chartBarLabel}>{item.label}</span>
              </div>
            ))
          )}
        </div>
        <div className={styles.chartSummary}>
          <div className={styles.chartSummaryItem}>
            <p className={styles.chartSummaryLabel}>Total</p>
            <p className={styles.chartSummaryValue}>${totalSales.toLocaleString()}</p>
          </div>
          <div className={styles.chartSummaryItem}>
            <p className={styles.chartSummaryLabel}>Promedio</p>
            <p className={`${styles.chartSummaryValue} ${styles.chartSummaryValuePositive}`}>
              ${averageSales.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

    </>
  )
}


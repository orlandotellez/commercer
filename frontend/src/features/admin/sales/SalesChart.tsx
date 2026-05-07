"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
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

// Tooltip personalizado
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.customTooltipLabel}>{label}</p>
        <p className={styles.customTooltipValue}>
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
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
    <div className={styles.salesChart}>
      <div className={styles.chartHeader}>
        <h2 className={styles.chartTitle}>Gráfico de Ventas</h2>
        <div className={styles.filterButtons}>
          {(["day", "week", "month"] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              className={`${styles.filterButton} ${timeFilter === filter ? styles.filterButtonActive : ""
                }`}
              onClick={() => {
                setTimeFilter(filter)
                fetchChartData(filter)
              }}
            >
              {filterLabels[filter]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartContainer}>
        {loadingChart ? (
          <div className={styles.chartPlaceholder}>
            <p>Cargando gráfica...</p>
          </div>
        ) : salesData.length === 0 ? (
          <div className={styles.chartPlaceholder}>
            <p>No hay datos para mostrar</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={salesData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                minTickGap={30}
              />
              <YAxis
                tickFormatter={(v) => `$${v.toLocaleString()}`}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                wrapperStyle={{ outline: "none" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {salesData.map((item, index) => (
                  <Cell
                    key={index}
                    fill={item.value === maxSales ? "#0f1729" : "#0f1729"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
  )
}

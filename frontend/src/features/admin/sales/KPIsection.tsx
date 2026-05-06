import styles from "./KPIsection.module.css"

interface KPI {
  title: string
  value: number | string
  color: string
  icon: any
}

interface KPIsectionProps {
  salesKPIs: KPI[]
}

export const KPIsection = ({ salesKPIs }: KPIsectionProps) => {
  return (
    <div className={styles.kpisGrid}>
      {salesKPIs.map((kpi, index) => (
        <div key={index} className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <div
              className={styles.kpiIconWrapper}
              style={{ backgroundColor: `${kpi.color}20` }}
            >
              <kpi.icon
                className={styles.kpiIcon}
                style={{ color: kpi.color }}
              />
            </div>
          </div>
          <p className={styles.kpiTitle}>{kpi.title}</p>
          <p className={styles.kpiValue}>${kpi.value}</p>
        </div>
      ))}
    </div>
  )
}

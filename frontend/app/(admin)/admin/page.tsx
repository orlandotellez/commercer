"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { DashboardResponse } from "@/shared/types";
import styles from "./page.module.css";
import { getDashboard, getDashboardChart } from "@/shared/api/dashboard";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";

// Icon mapping for KPIs
const kpiIconMap: Record<string, React.ComponentType<any>> = {
  "Ventas Totales": DollarSign,
  "Pedidos": ShoppingCart,
  "Usuarios": Users,
  "Productos": Package,
};

const kpiColorMap: Record<string, string> = {
  "Ventas Totales": "#10B981",
  "Pedidos": "#3B82F6",
  "Usuarios": "#F38020",
  "Productos": "#EF4444",
};

const statusClassMap: Record<string, string> = {
  completed: styles.orderStatusCompleted,
  processing: styles.orderStatusProcessing,
  shipped: styles.orderStatusShipped,
  pending: styles.orderStatusPending,
};

type TimeFilter = "day" | "week" | "month";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getDashboard(timeFilter);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchDashboard();
    }
  }, [mounted]);

  const fetchChartData = async (period: TimeFilter) => {
    if (!data) return;

    try {
      setLoadingChart(true);
      const result = await getDashboardChart(period);
      // Only update the sales_chart part
      setData(prev => prev ? { ...prev, sales_chart: result } : null);
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setLoadingChart(false);
    }
  };

  // Initialize mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // ALL hook calculations MUST be before any conditional returns (React Hooks Rule)
  const kpisWithIcons = !data ? [] : data.kpis.map((kpi) => ({
    ...kpi,
    icon: kpiIconMap[kpi.title] || DollarSign,
    color: kpiColorMap[kpi.title] || "#10B981",
  }));

  const salesData = data?.sales_chart || [];

  const maxSales = useMemo(() => {
    if (salesData.length === 0) return 0;
    return Math.max(...salesData.map((d: any) => d.value));
  }, [salesData]);

  const totalSales = useMemo(() => {
    return salesData.reduce((acc: number, d: any) => acc + d.value, 0);
  }, [salesData]);

  const averageSales = useMemo(() => {
    if (salesData.length === 0) return 0;
    return Math.round(totalSales / salesData.length);
  }, [totalSales, salesData]);

  const filterLabels: Record<TimeFilter, string> = {
    day: "Día",
    week: "Semana",
    month: "Mes",
  };

  // Conditional returns AFTER all hooks
  if (!mounted) return null;

  console.log(salesData)

  if (loading) {
    return <LoadingState title="Cargando dashboard..." />;
  }

  if (error) {
    return <ErrorState error={error} fetch={() => fetchChartData} />;
  }

  if (!data) return null;

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Vista general del rendimiento del e-commerce
          </p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.lastUpdateLabel}>Última actualización:</span>
          <span className={styles.lastUpdateValue}>
            {new Date().toLocaleString("es-AR")}
          </span>
        </div>
      </div>

      {/* KPIs Row */}
      <div className={styles.kpisGrid}>
        {kpisWithIcons.map((kpi, index) => (
          <div key={index} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div
                className={styles.kpiIconWrapper}
                style={{ backgroundColor: `${kpi.color}20` }}
              >
                <kpi.icon className={styles.kpiIcon} style={{ color: kpi.color }} />
              </div>
              <div
                className={`${styles.kpiTrend} ${kpi.trend === "up" ? styles.kpiTrendUp : styles.kpiTrendDown
                  }`}
              >
                {kpi.trend === "up" ? (
                  <TrendingUp className={styles.kpiTrendIcon} />
                ) : (
                  <TrendingDown className={styles.kpiTrendIcon} />
                )}
                {kpi.change}
              </div>
            </div>
            <p className={styles.kpiTitle}>{kpi.title}</p>
            <p className={styles.kpiValue}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Chart & Orders Row */}
      <div className={styles.chartsRow}>
        {/* Sales Chart */}
        <div className={styles.salesChart}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Ventas</h2>
            <div className={styles.filterButtons}>
              {(["day", "week", "month"] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  className={`${styles.filterButton} ${timeFilter === filter ? styles.filterButtonActive : ""}`}
                  onClick={() => {
                    setTimeFilter(filter); // Update button style
                    fetchChartData(filter); // Fetch ONLY chart data
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

        {/* Recent Orders */}
        <div className={styles.recentOrders}>
          <div className={styles.ordersHeader}>
            <h2 className={styles.ordersTitle}>Últimos Pedidos</h2>
            <button className={styles.ordersViewAll}>
              Ver todos <ArrowRight className={styles.ordersViewAllIcon} />
            </button>
          </div>
          <div className={styles.ordersList}>
            {data.recent_orders.map((order) => (
              <div key={order.id} className={styles.orderItem}>
                <div className={styles.orderHeader}>
                  <span className={styles.orderId}>{order.id}</span>
                  <span
                    className={`${styles.orderStatus} ${statusClassMap[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className={styles.orderDetails}>
                  <span className={styles.orderCustomer}>
                    {order.products.slice(0, 3).join(", ")}
                    {order.has_more && " Ver más"}
                  </span>
                  <span className={styles.orderTotal}>{order.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className={styles.bottomRow}>
        {/* Inventory Alerts */}
        <div className={styles.inventoryAlerts}>
          <div className={styles.alertsHeader}>
            <div className={styles.alertsTitleWrapper}>
              <AlertTriangle className={styles.alertsIcon} />
              <h2 className={styles.alertsTitle}>Alertas de Inventario</h2>
            </div>
            <span className={styles.urgentBadge}>
              {data.inventory_alerts.filter((a) => a.urgent).length} Urgentes
            </span>
          </div>
          <div className={styles.alertsList}>
            {data.inventory_alerts.map((item, index) => (
              <div key={index} className={styles.alertItem}>
                <div className={styles.alertProductInfo}>
                  <Package className={styles.alertProductIcon} />
                  <span className={styles.alertProductName}>{item.product}</span>
                </div>
                <div className={styles.alertStockInfo}>
                  <span
                    className={`${styles.alertStockValue} ${item.urgent ? styles.alertStockUrgent : styles.alertStockWarning
                      }`}
                  >
                    Stock: {item.stock} / {item.threshold}
                  </span>
                  <div className={styles.alertStockBar}>
                    <div
                      className={`${styles.alertStockBarFill} ${item.urgent
                        ? styles.alertStockBarUrgent
                        : styles.alertStockBarWarning
                        }`}
                      style={{
                        width: `${Math.min((item.stock / item.threshold) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className={styles.topProducts}>
          <div className={styles.productsHeader}>
            <h2 className={styles.productsTitle}>Productos Más Vendidos</h2>
            <button className={styles.productsViewAll}>
              Ver todos <ArrowRight className={styles.ordersViewAllIcon} />
            </button>
          </div>
          <div className={styles.productsTableWrapper}>
            <table className={styles.productsTable}>
              <thead>
                <tr className={styles.tableHead}>
                  <th className={styles.tableHeadCell}>Producto</th>
                  <th className={`${styles.tableHeadCell} ${styles.tableHeadCellRight}`}>
                    Ventas
                  </th>
                  <th className={`${styles.tableHeadCell} ${styles.tableHeadCellRight}`}>
                    Ingresos
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.top_products.map((product, index) => (
                  <tr key={index} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className={styles.productRank}>#{index + 1}</span>
                        <span className={styles.productName}>{product.name}</span>
                      </div>
                    </td>
                    <td className={`${styles.tableCell} ${styles.tableCellRight} ${styles.productSales}`}>
                      {product.sales}
                    </td>
                    <td className={`${styles.tableCell} ${styles.tableCellRight} ${styles.productRevenue}`}>
                      {product.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

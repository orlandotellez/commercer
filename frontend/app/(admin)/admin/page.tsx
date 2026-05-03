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
import styles from "./page.module.css";

type TimeFilter = "day" | "week" | "month";

// Datos por período
const generateSalesData = (filter: TimeFilter) => {
  switch (filter) {
    case "day":
      return [
        { label: "Lun", value: 12450 },
        { label: "Mar", value: 15200 },
        { label: "Mié", value: 11800 },
        { label: "Jue", value: 18900 },
        { label: "Vie", value: 22100 },
        { label: "Sáb", value: 28500 },
        { label: "Dom", value: 19200 },
      ];
    case "week":
      return [
        { label: "Sem 1", value: 89500 },
        { label: "Sem 2", value: 78200 },
        { label: "Sem 3", value: 93400 },
        { label: "Sem 4", value: 110800 },
      ];
    case "month":
    default:
      return [
        { label: "Ene", value: 45000 },
        { label: "Feb", value: 52000 },
        { label: "Mar", value: 48000 },
        { label: "Abr", value: 61000 },
        { label: "May", value: 55000 },
        { label: "Jun", value: 67000 },
        { label: "Jul", value: 72000 },
        { label: "Ago", value: 69000 },
        { label: "Sep", value: 81000 },
        { label: "Oct", value: 78000 },
        { label: "Nov", value: 95000 },
        { label: "Dic", value: 110000 },
      ];
  }
};

// Datos de prueba
const kpiData = [
  {
    title: "Ventas Totales",
    value: "$124,589",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "#10B981",
  },
  {
    title: "Pedidos",
    value: "1,247",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    color: "#3B82F6",
  },
  {
    title: "Usuarios",
    value: "8,934",
    change: "+15.3%",
    trend: "up",
    icon: Users,
    color: "#F38020",
  },
  {
    title: "Productos",
    value: "342",
    change: "-2.1%",
    trend: "down",
    icon: Package,
    color: "#EF4444",
  },
];

const recentOrders = [
  {
    id: "ORD-7829",
    customer: "Juan Pérez",
    total: "$1,299.00",
    status: "completed",
    date: "2026-04-05",
  },
  {
    id: "ORD-7828",
    customer: "María García",
    total: "$849.50",
    status: "processing",
    date: "2026-04-05",
  },
  {
    id: "ORD-7827",
    customer: "Carlos López",
    total: "$2,199.00",
    status: "shipped",
    date: "2026-04-04",
  },
  {
    id: "ORD-7826",
    customer: "Ana Martínez",
    total: "$459.99",
    status: "pending",
    date: "2026-04-04",
  },
];

const inventoryAlerts = [
  { product: "NVIDIA RTX 5080", stock: 3, threshold: 10, urgent: true },
  { product: "AMD Ryzen 9 9950X", stock: 5, threshold: 10, urgent: true },
  { product: "Corsair Vengeance 32GB", stock: 8, threshold: 15, urgent: false },
  { product: "Samsung 990 Pro 2TB", stock: 12, threshold: 20, urgent: false },
];

const topProducts = [
  { name: "NVIDIA RTX 5090", sales: 89, revenue: "$124,789" },
  { name: "AMD Ryzen 9 9950X", sales: 67, revenue: "$66,133" },
  { name: "Corsair Dominator 64GB", sales: 54, revenue: "$32,400" },
  { name: "Samsung 990 Pro 2TB", sales: 48, revenue: "$47,520" },
  { name: "ASUS ROG Maximus", sales: 41, revenue: "$28,085" },
];

const statusClassMap: Record<string, string> = {
  completed: styles.orderStatusCompleted,
  processing: styles.orderStatusProcessing,
  shipped: styles.orderStatusShipped,
  pending: styles.orderStatusPending,
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");

  const salesData = useMemo(() => generateSalesData(timeFilter), [timeFilter]);
  const maxSales = useMemo(() => Math.max(...salesData.map((d) => d.value)), [salesData]);
  const totalSales = useMemo(() => salesData.reduce((acc, d) => acc + d.value, 0), [salesData]);
  const averageSales = useMemo(() => Math.round(totalSales / salesData.length), [totalSales, salesData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filterLabels: Record<TimeFilter, string> = {
    day: "Día",
    week: "Semana",
    month: "Mes",
  };

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
        {kpiData.map((kpi, index) => (
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
                  onClick={() => setTimeFilter(filter)}
                >
                  {filterLabels[filter]}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.chartBars}>
            {salesData.map((item, index) => (
              <div key={index} className={styles.chartBarWrapper}>
                <div
                  className={styles.chartBar}
                  style={{
                    height: `${(item.value / maxSales) * 100}%`,
                  }}
                >
                  <div className={styles.chartBarTooltip}>
                    ${item.value.toLocaleString()}
                  </div>
                </div>
                <span className={styles.chartBarLabel}>{item.label}</span>
              </div>
            ))}
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
            {recentOrders.map((order) => (
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
                  <span className={styles.orderCustomer}>{order.customer}</span>
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
              {inventoryAlerts.filter((a) => a.urgent).length} Urgentes
            </span>
          </div>
          <div className={styles.alertsList}>
            {inventoryAlerts.map((item, index) => (
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
                {topProducts.map((product, index) => (
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

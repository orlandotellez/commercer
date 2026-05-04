"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { getDashboard, getDashboardChart } from "@/shared/lib/api";
import { DashboardResponse } from "@/shared/types";
import styles from "../page.module.css";

type TimeFilter = "day" | "week" | "month";

export default function SalesPage() {
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
  }, [mounted, timeFilter]);

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

  // Sales KPIs - 3 cards only
  const salesKPIs = !data ? [] : [
    {
      title: "Total Sales",
      value: data.total_sales?.toFixed(2) || "0.00",
      icon: DollarSign,
      color: "#10B981"
    },
    {
      title: "Completed Sales",
      value: data.completed_sales?.toFixed(2) || "0.00",
      icon: TrendingUp,
      color: "#3B82F6"
    },
    {
      title: "Pending Sales",
      value: data.pending_sales?.toFixed(2) || "0.00",
      icon: TrendingDown,
      color: "#F38020"
    },
  ];

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

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <p>Cargando página de ventas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={styles.container}>
      {/* Page Header */}
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

      {/* KPIs Row - 3 Sales Cards Only */}
      <div className={styles.kpisGrid}>
        {salesKPIs.map((kpi, index) => (
          <div key={index} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <div
                className={styles.kpiIconWrapper}
                style={{ backgroundColor: `${kpi.color}20` }}
              >
                <kpi.icon className={styles.kpiIcon} style={{ color: kpi.color }} />
              </div>
            </div>
            <p className={styles.kpiTitle}>{kpi.title}</p>
            <p className={styles.kpiValue}>${kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Sales Chart */}
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
    </div>
  );
}

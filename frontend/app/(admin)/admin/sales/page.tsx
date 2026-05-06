"use client";

import styles from "../page.module.css";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { Header } from "@/features/admin/sales/Header";
import { KPIsection } from "@/features/admin/sales/KPIsection";
import { SalesChart } from "@/features/admin/sales/SalesChart";
import { useSalesDashboard } from "@/shared/hooks/useSales";

export default function SalesPage() {
  const {
    mounted,
    loading,
    error,
    salesKPIs,
    salesData,
    loadingChart,
    timeFilter,
    setTimeFilter,
    fetchChartData,
    totalSales,
    averageSales,
    maxSales,
    filterLabels,
  } = useSalesDashboard()

  if (loading) {
    return <LoadingState title="Cargando ventas..." />;
  }

  if (error) {
    return <ErrorState error={error} fetch={() => fetchChartData} />;
  }

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <Header />

      {error && <ErrorState error={error} fetch={() => fetchChartData} />}

      {/* KPIs Row */}
      <div className={styles.row}>
        <KPIsection salesKPIs={salesKPIs} />
      </div>

      {/* Sales Chart */}
      <SalesChart
        salesData={salesData}
        loadingChart={loadingChart}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        fetchChartData={fetchChartData}
        totalSales={totalSales}
        averageSales={averageSales}
        maxSales={maxSales}
        filterLabels={filterLabels}
      />
    </div>
  );
}

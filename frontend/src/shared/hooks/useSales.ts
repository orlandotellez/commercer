import { useState, useEffect, useMemo } from "react"
import { TrendingUp, TrendingDown, DollarSign, LucideIcon } from "lucide-react"
import { getDashboard, getDashboardChart } from "@/shared/api/dashboard"
import { DashboardResponse } from "@/shared/types"

export type TimeFilter = "day" | "week" | "month"

interface SalesDataItem {
  label: string
  value: number
}

interface KPI {
  title: string
  value: string
  icon: LucideIcon
  color: string
}

export const useSalesDashboard = () => {
  const [mounted, setMounted] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month")
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingChart, setLoadingChart] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initial mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch dashboard
  useEffect(() => {
    if (!mounted) return

    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await getDashboard(timeFilter)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [mounted, timeFilter])

  // Fetch chart only
  const fetchChartData = async (period: TimeFilter) => {
    if (!data) return

    try {
      setLoadingChart(true)
      const result = await getDashboardChart(period)

      setData(prev =>
        prev ? { ...prev, sales_chart: result } : null
      )
    } catch (err) {
      console.error("Error fetching chart data:", err)
    } finally {
      setLoadingChart(false)
    }
  }

  // KPIs
  const salesKPIs: KPI[] = !data
    ? []
    : [
      {
        title: "Total Sales",
        value: data.total_sales?.toFixed(2) || "0.00",
        icon: DollarSign,
        color: "#10B981",
      },
      {
        title: "Completed Sales",
        value: data.completed_sales?.toFixed(2) || "0.00",
        icon: TrendingUp,
        color: "#3B82F6",
      },
      {
        title: "Pending Sales",
        value: data.pending_sales?.toFixed(2) || "0.00",
        icon: TrendingDown,
        color: "#F38020",
      },
    ]

  // Chart data
  const salesData: SalesDataItem[] = data?.sales_chart || []

  const maxSales = useMemo(() => {
    if (salesData.length === 0) return 0
    return Math.max(...salesData.map(d => d.value))
  }, [salesData])

  const totalSales = useMemo(() => {
    return salesData.reduce((acc, d) => acc + d.value, 0)
  }, [salesData])

  const averageSales = useMemo(() => {
    if (salesData.length === 0) return 0
    return Math.round(totalSales / salesData.length)
  }, [totalSales, salesData])

  const filterLabels: Record<TimeFilter, string> = {
    day: "Día",
    week: "Semana",
    month: "Mes",
  }

  return {
    mounted,
    loading,
    loadingChart,
    error,

    timeFilter,
    setTimeFilter,

    salesKPIs,
    salesData,

    maxSales,
    totalSales,
    averageSales,

    filterLabels,

    fetchChartData,
  }
}

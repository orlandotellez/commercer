import { useCallback, useEffect, useState } from "react";
import { Order, OrderStatus } from "../types";
import { listOrders } from "../lib/api";
import { mapApiOrderToUi } from "../lib/mappers";

const ITEMS_PER_PAGE = 10;

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchOrders = useCallback(async (params: {
    page: number;
    status?: OrderStatus;
    date_from?: string;
    date_to?: string;
    search?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await listOrders({
        page: params.page,
        limit: ITEMS_PER_PAGE,
        ...(params.status && { status: params.status }),
        ...(params.date_from && { date_from: params.date_from }),
        ...(params.date_to && { date_to: params.date_to }),
      });

      let mapped = response.orders.map(mapApiOrderToUi);

      if (params.search) {
        const term = params.search.toLowerCase();
        mapped = mapped.filter(
          (o) =>
            o.id.toLowerCase().includes(term) ||
            o.customer.toLowerCase().includes(term)
        );
      }

      setOrders(mapped);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Un solo effect, debounce unificado para todos los filtros
  useEffect(() => {
    const id = setTimeout(() => {
      fetchOrders({
        page: currentPage,
        status: statusFilter !== "all" ? statusFilter : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        search: searchTerm || undefined,
      });
    }, searchTerm ? 300 : 0); // debounce solo cuando hay búsqueda de texto

    return () => clearTimeout(id);
  }, [currentPage, statusFilter, dateFrom, dateTo, searchTerm, fetchOrders]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
    // NO llamar fetchOrders acá — el effect de arriba se encarga
  };

  const activeFiltersCount = [statusFilter !== "all", dateFrom, dateTo].filter(Boolean).length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return {
    orders, loading, error, total, totalPages,
    currentPage, setCurrentPage,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    activeFiltersCount,
    clearFilters,
    fetchOrders,
  };
}

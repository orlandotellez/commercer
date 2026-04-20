"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import styles from "./page.module.css";
import {
  listOrders,
  updateOrderStatus,
  deleteOrder,
  OrderResponse,
} from "@/shared/lib/api";

// Tipos para la UI
type OrderStatus = "pending" | "processing" | "shipped" | "completed" | "cancelled";

interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: OrderStatus;
  date: string;
  items: number;
  user_id: string;
}

// Mapear respuesta de API a formato de UI
function mapApiOrderToUi(apiOrder: OrderResponse): Order {
  return {
    id: apiOrder.id,
    customer: apiOrder.user_id, // Por ahora mostrar user_id como cliente
    email: "", // El backend no devuelve email del usuario todavía
    total: apiOrder.total,
    status: apiOrder.status as OrderStatus,
    date: apiOrder.created_at?.split("T")[0] || "",
    items: apiOrder.items.length,
    user_id: apiOrder.user_id,
  };
}

// Componente de paginación
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button
        className={styles.paginationButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className={styles.paginationIcon} />
        Anterior
      </button>
      
      <div className={styles.paginationNumbers}>
        {getPageNumbers().map((page, index) => (
          <span key={index}>
            {page === "..." ? (
              <span className={styles.paginationEllipsis}>...</span>
            ) : (
              <button
                className={`${styles.paginationNumber} ${page === currentPage ? styles.paginationNumberActive : ""}`}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </button>
            )}
          </span>
        ))}
      </div>
      
      <button
        className={styles.paginationButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Siguiente
        <ChevronRight className={styles.paginationIcon} />
      </button>
    </div>
  );
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  shipped: "Enviado",
  completed: "Completado",
  cancelled: "Cancelado",
};

const statusClassMap: Record<OrderStatus, string> = {
  pending: styles.orderStatusPending,
  processing: styles.orderStatusProcessing,
  shipped: styles.orderStatusShipped,
  completed: styles.orderStatusCompleted,
  cancelled: styles.orderStatusCancelled,
};

const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Estados de la API
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar pedidos desde la API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (dateFrom) {
        params.date_from = dateFrom;
      }

      if (dateTo) {
        params.date_to = dateTo;
      }

      const response = await listOrders(params);

      const mappedOrders = response.orders.map(mapApiOrderToUi);

      // Filtrar por search term del lado del cliente
      let filtered = mappedOrders;
      if (searchTerm) {
        filtered = mappedOrders.filter(
          (order) =>
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setOrders(filtered);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar pedidos");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, dateFrom, dateTo, searchTerm]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchOrders();
    }
  }, [mounted, fetchOrders]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
    fetchOrders();
  };

  const activeFiltersCount = [
    statusFilter !== "all",
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  // Refrescar cuando cambian los filtros
  useEffect(() => {
    if (mounted && !loading) {
      const timeoutId = setTimeout(() => {
        fetchOrders();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [statusFilter, dateFrom, dateTo]);

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Pedidos</h1>
          <p className={styles.pageSubtitle}>
            Gestiona todos los pedidos de tu tienda
          </p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.exportButton}>
            <Download className={styles.exportIcon} />
            Exportar
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por ID, cliente o email..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <button
          className={`${styles.filterToggle} ${showFilters ? styles.filterToggleActive : ""}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className={styles.filterIcon} />
          Filtros
          {activeFiltersCount > 0 && (
            <span className={styles.filterBadge}>{activeFiltersCount}</span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className={styles.advancedFilters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Estado</label>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | "all");
                setCurrentPage(1);
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="processing">Procesando</option>
              <option value="shipped">Enviado</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Desde</label>
            <div className={styles.dateInputWrapper}>
              <Calendar className={styles.dateIcon} />
              <input
                type="date"
                className={styles.filterInput}
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Hasta</label>
            <div className={styles.dateInputWrapper}>
              <Calendar className={styles.dateIcon} />
              <input
                type="date"
                className={styles.filterInput}
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          
          <button className={styles.clearFilters} onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.errorState}>
          <AlertCircle className={styles.errorIcon} />
          <span>{error}</span>
          <button onClick={fetchOrders} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingState}>
          <Loader2 className={styles.loadingSpinner} />
          <span>Cargando pedidos...</span>
        </div>
      )}

      {/* Results Info */}
      {!loading && !error && (
        <div className={styles.resultsInfo}>
          <span className={styles.resultsCount}>
            {orders.length} pedidos encontrados
          </span>
          {totalPages > 1 && (
            <span className={styles.resultsPage}>
              Página {currentPage} de {totalPages}
            </span>
          )}
        </div>
      )}

      {/* Orders Table */}
      {!loading && !error && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHead}>
                <th className={styles.tableHeadCell}>ID</th>
                <th className={styles.tableHeadCell}>Cliente</th>
                <th className={styles.tableHeadCell}>Fecha</th>
                <th className={styles.tableHeadCell}>Items</th>
                <th className={`${styles.tableHeadCell} ${styles.tableHeadCellRight}`}>Total</th>
                <th className={styles.tableHeadCell}>Estado</th>
                <th className={styles.tableHeadCell}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    No se encontraron pedidos
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                <tr key={order.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <span className={styles.orderId}>{order.id}</span>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.customerInfo}>
                      <span className={styles.customerName}>{order.customer}</span>
                      <span className={styles.customerEmail}>{order.email}</span>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.orderDate}>
                      {new Date(order.date).toLocaleDateString("es-AR")}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.orderItems}>{order.items}</span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                    <span className={styles.orderTotal}>
                      ${order.total.toLocaleString("es-AR")}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.orderStatus} ${statusClassMap[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.actions}>
                      <button className={styles.actionButton} title="Ver detalles">
                        <Eye className={styles.actionIcon} />
                      </button>
                      <button className={styles.actionButton} title="Editar">
                        <Edit className={styles.actionIcon} />
                      </button>
                      <button className={`${styles.actionButton} ${styles.actionButtonDanger}`} title="Eliminar">
                        <Trash2 className={styles.actionIcon} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

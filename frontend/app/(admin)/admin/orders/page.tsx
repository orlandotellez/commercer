"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import styles from "./page.module.css";

// Tipos
type OrderStatus = "pending" | "processing" | "shipped" | "completed" | "cancelled";

interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: OrderStatus;
  date: string;
  items: number;
}

// Datos mock
const generateMockOrders = (): Order[] => {
  const statuses: OrderStatus[] = ["pending", "processing", "shipped", "completed", "cancelled"];
  const customers = [
    { name: "Juan Pérez", email: "juan@example.com" },
    { name: "María García", email: "maria@example.com" },
    { name: "Carlos López", email: "carlos@example.com" },
    { name: "Ana Martínez", email: "ana@example.com" },
    { name: "Pedro Sánchez", email: "pedro@example.com" },
    { name: "Laura Rodríguez", email: "laura@example.com" },
    { name: "Miguel Torres", email: "miguel@example.com" },
    { name: "Sofia Ramirez", email: "sofia@example.com" },
    { name: "Diego Flores", email: "diego@example.com" },
    { name: "Carmen Ruiz", email: "carmen@example.com" },
  ];

  return Array.from({ length: 85 }, (_, i) => {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const date = new Date(2026, Math.floor(Math.random() * 4), Math.floor(Math.random() * 28) + 1);
    
    return {
      id: `ORD-${7800 + i}`,
      customer: customer.name,
      email: customer.email,
      total: Math.floor(Math.random() * 2000) + 100,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: date.toISOString().split("T")[0],
      items: Math.floor(Math.random() * 5) + 1,
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const mockOrders = generateMockOrders();

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      const orderDate = new Date(order.date);
      const matchesDateFrom = !dateFrom || orderDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || orderDate <= new Date(dateTo);
      
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    statusFilter !== "all",
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

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

      {/* Results Info */}
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          {filteredOrders.length} pedidos encontrados
        </span>
        {activeFiltersCount > 0 && (
          <span className={styles.resultsPage}>
            Página {currentPage} de {totalPages}
          </span>
        )}
      </div>

      {/* Orders Table */}
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
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  No se encontraron pedidos
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

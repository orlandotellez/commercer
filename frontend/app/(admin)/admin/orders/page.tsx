"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { Order, OrderStatus } from "@/shared/types";
import { Pagination } from "@/features/admin/orders/Pagination";
import { ViewOrderModal } from "@/features/admin/orders/modals/ViewOrderModal";
import { OrdersTable } from "@/features/admin/orders/OrdersTable";
import { Filters } from "@/features/admin/orders/Filters";
import { Header } from "@/features/admin/orders/Header";
import { ResultsInfo } from "@/features/admin/orders/ResultsInfo";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { useOrders } from "@/shared/hooks/useOrders";

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

export default function OrdersPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const {
    orders, loading, error, totalPages,
    currentPage, setCurrentPage,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    activeFiltersCount,
    clearFilters,
    fetchOrders,
  } = useOrders()

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <Header orders={orders} statusLabels={statusLabels} />

      {/* Filters Section */}
      <Filters
        searchTerm={searchTerm}
        setSearchTerm={(e) => setSearchTerm(e.target.value)}
        setCurrentPage={setCurrentPage}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        statusFilter={statusFilter}
        setStatusFilter={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
        dateFrom={dateFrom}
        setDateFrom={(e) => setDateFrom(e.target.value)}
        dateTo={dateTo}
        setDateTo={(e) => setDateTo(e.target.value)}
        clearFilters={clearFilters}
      />

      {/* Error State */}
      {error && <ErrorState error={error} fetch={() => fetchOrders} />}

      {/* Loading State */}
      {loading && <LoadingState title="Cargando pedidos..." />}

      {/* Results Info */}
      {!loading && !error && <ResultsInfo orders={orders.length} totalPages={totalPages} currentPage={currentPage} />}

      {/* Orders Table */}
      {!loading && !error &&
        <OrdersTable
          orders={orders}
          statusClassMap={statusClassMap}
          statusLabels={statusLabels}
          setSelectedOrder={setSelectedOrder}
          setShowViewModal={setShowViewModal}
        />
      }

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

       {/* View Order Modal */}
       <ViewOrderModal
         order={selectedOrder}
         isOpen={showViewModal}
         onClose={() => {
           setShowViewModal(false);
           setSelectedOrder(null);
         }}
         statusClassMap={statusClassMap}
         statusLabels={statusLabels}
         onStatusUpdate={() => {
           fetchOrders({ page: currentPage });
         }}
         onOrderUpdated={(updatedOrder) => {
           // Map the API response to UI format and update selected order
           if (updatedOrder && selectedOrder) {
             const mappedOrder = {
               ...selectedOrder,
               status: updatedOrder.status || selectedOrder.status,
             };
             setSelectedOrder(mappedOrder);
           }
         }}
       />
    </div>
  );
}

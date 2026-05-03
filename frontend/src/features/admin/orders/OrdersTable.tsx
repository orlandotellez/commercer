import { Eye } from "lucide-react";
import styles from "./OrdersTable.module.css"
import { Order, OrderStatus } from "@/shared/types";

interface OrdersTableProps {
  orders: Order[]
  statusLabels: Record<OrderStatus, string>
  statusClassMap: Record<OrderStatus, string>
  setSelectedOrder: (order: Order) => void
  setShowViewModal: (value: boolean) => void
}

export const OrdersTable = ({ orders, statusLabels, statusClassMap, setSelectedOrder, setShowViewModal }: OrdersTableProps) => {
  return (
    <>
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
                      <button
                        className={styles.actionButton}
                        title="Ver detalles"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowViewModal(true);
                        }}
                      >
                        <Eye className={styles.actionIcon} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

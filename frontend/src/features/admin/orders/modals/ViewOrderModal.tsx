import { X } from "lucide-react";
import styles from "./ViewOrderModal.module.css"

// Tipos para la UI
type OrderStatus = "pending" | "processing" | "shipped" | "completed" | "cancelled";

interface OrderItem {
  id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: OrderStatus;
  date: string;
  items: number;
  user_id: string;
  subtotal?: number;
  taxes?: number;
  created_at?: string;
  order_items?: OrderItem[];
}

interface ViewOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  statusLabels: Record<OrderStatus, string>;
  statusClassMap: Record<OrderStatus, string>;
}

export const ViewOrderModal = ({ 
  order, 
  isOpen, 
  onClose, 
  statusLabels, 
  statusClassMap 
}: ViewOrderModalProps) => {
  if (!isOpen || !order) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Detalle del Pedido</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X className={styles.modalCloseIcon} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>ID</span>
            <span className={styles.detailValue}>{order.id}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Cliente</span>
            <span className={styles.detailValue}>{order.customer}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Fecha</span>
            <span className={styles.detailValue}>
              {order.date ? new Date(order.date).toLocaleDateString("es-AR") : "N/A"}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Estado</span>
            <span className={`${styles.orderStatus} ${statusClassMap[order.status]}`}>
              {statusLabels[order.status]}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Items</span>
            <span className={styles.detailValue}>{order.items} productos</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Subtotal</span>
            <span className={styles.detailValue}>
              ${(order.subtotal || order.total / 1.21).toFixed(2)}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>IVA</span>
            <span className={styles.detailValue}>
              ${(order.taxes || order.total - (order.total / 1.21)).toFixed(2)}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Total</span>
            <span className={styles.detailValue}>${order.total.toFixed(2)}</span>
          </div>

          {/* Productos del pedido */}
          {order.order_items && order.order_items.length > 0 && (
            <div className={styles.productsSection}>
              <h3 className={styles.productsTitle}>Productos</h3>
              <table className={styles.productsTable}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name || 'Producto'}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unit_price.toFixed(2)}</td>
                      <td>${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

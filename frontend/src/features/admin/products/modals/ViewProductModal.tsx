import { AdminProduct } from "@/shared/types";
import styles from "./Modal.module.css";
import { X } from "lucide-react";

interface ViewProductModalProps {
  product: AdminProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewProductModal = ({ product, isOpen, onClose }: ViewProductModalProps) => {
  if (!isOpen || !product) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Detalle del Producto</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X className={styles.modalCloseIcon} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>ID</span>
            <span className={styles.detailValue}>{product.id}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Nombre</span>
            <span className={styles.detailValue}>{product.name}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Slug</span>
            <span className={styles.detailValue}>{product.slug}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Categoría</span>
            <span className={styles.detailValue}>{product.category || "Sin categoría"}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Marca</span>
            <span className={styles.detailValue}>{product.brand || "No especificada"}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Precio</span>
            <span className={styles.detailValue}>${product.price.toFixed(2)}</span>
          </div>
          {product.originalPrice && typeof product.originalPrice === "number" && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Precio Original</span>
              <span className={styles.detailValue}>${product.originalPrice.toFixed(2)}</span>
            </div>
          )}
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Stock</span>
            <span className={styles.detailValue}>{product.stock} unidades</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Estado</span>
            <span className={styles.detailValue}>          {product.status === 'active' ? 'Activo' : 'Inactivo'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Destacado</span>
            <span className={styles.detailValue}>{product.featured ? "Sí" : "No"}</span>
          </div>
          {product.description && (
            <div className={styles.detailRow} style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <span className={styles.detailLabel}>Descripción</span>
              <span className={styles.detailValue}>{product.description}</span>
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

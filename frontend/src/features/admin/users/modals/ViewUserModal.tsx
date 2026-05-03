import { User } from "@/shared/types";
import styles from "./ViewUserModal.module.css"
import { X } from "lucide-react";

// Modal de ver usuario
interface ViewUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  staff: "Personal",
  customer: "Cliente",
};

const roleClassMap: Record<string, string> = {
  admin: styles.userRoleAdmin,
  staff: styles.userRoleStaff,
  customer: styles.userRoleCustomer,
};

export const ViewUserModal: React.FC<ViewUserModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Detalle del Usuario</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X className={styles.modalCloseIcon} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>ID</span>
            <span className={styles.detailValue}>{user.id}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Nombre</span>
            <span className={styles.detailValue}>{user.name}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{user.email}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Teléfono</span>
            <span className={styles.detailValue}>{user.phone || "No registrado"}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Rol</span>
            <span className={`${styles.userRole} ${roleClassMap[user.role]}`}>
              {roleLabels[user.role] || user.role}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Email verificado</span>
            <span className={styles.detailValue}>
              {user.email_verified ? "Sí" : "No"}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Fecha de registro</span>
            <span className={styles.detailValue}>
              {user.created_at ? new Date(user.created_at).toLocaleDateString("es-AR") : "N/A"}
            </span>
          </div>
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


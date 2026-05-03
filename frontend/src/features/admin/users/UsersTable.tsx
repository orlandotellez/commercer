import { User } from "@/shared/types";
import styles from "./UsersTable.module.css"
import { getInitials } from "@/shared/utils/format";
import { Edit, Eye, Mail, Shield, Trash2, User as UserIcon } from "lucide-react";

interface UsersTableProps {
  filteredUsers: User[];
  setSelectedUser: (user: User) => void;
  setShowViewModal: (value: boolean) => void;
  setShowEditModal: (value: boolean) => void;
  handleDelete: (id: string) => void; // o number, según tu modelo
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


export const UsersTable = ({
  filteredUsers,
  setSelectedUser,
  setShowViewModal,
  setShowEditModal,
  handleDelete
}: UsersTableProps
) => {
  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHead}>
              <th className={styles.tableHeadCell}>Usuario</th>
              <th className={styles.tableHeadCell}>Rol</th>
              <th className={styles.tableHeadCell}>Verificado</th>
              <th className={styles.tableHeadCell}>Fecha de registro</th>
              <th className={styles.tableHeadCell}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}>
                        <span className={styles.userAvatarText}>
                          {getInitials(user.name)}
                        </span>
                      </div>
                      <div className={styles.userDetails}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span
                      className={`${styles.userRole} ${roleClassMap[user.role] || styles.userRoleCustomer}`}
                    >
                      {user.role === "admin" && <Shield className={styles.roleIcon} />}
                      {user.role === "staff" && <Mail className={styles.roleIcon} />}
                      {user.role === "customer" && <UserIcon className={styles.roleIcon} />}
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <span
                      className={`${styles.userStatus} ${user.email_verified
                        ? styles.userStatusActive
                        : styles.userStatusInactive
                        }`}
                    >
                      {user.email_verified ? "Verificado" : "Pendiente"}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.userDate}>
                      {new Date(user.created_at).toLocaleDateString("es-AR")}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionButton}
                        title="Ver detalles"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowViewModal(true);
                        }}
                      >
                        <Eye className={styles.actionIcon} />
                      </button>
                      <button
                        className={styles.actionButton}
                        title="Editar"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className={styles.actionIcon} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                        title="Eliminar"
                        onClick={() => handleDelete(user.id)}
                      >
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


    </>
  )
}


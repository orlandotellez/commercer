"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Edit,
  Trash2,
  User,
  X,
  Mail,
  Shield,
  Loader2,
  AlertCircle,
} from "lucide-react";
import styles from "./page.module.css";

// Tipos
type UserRole = "admin" | "staff" | "customer";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  email_verified: boolean;
  phone?: string;
  created_at: string;
}

// API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const getToken = (): string | null => {
  return localStorage.getItem("access_token");
};

const ITEMS_PER_PAGE = 10;

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

// Modal de crear usuario
interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("No hay sesión iniciada");
        return;
      }

      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al crear usuario");
      }

      onSuccess();
      setName("");
      setEmail("");
      setPassword("");
      setRole("customer");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Nuevo Usuario</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X className={styles.modalCloseIcon} />
          </button>
        </div>

        <form className={styles.modalBody} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.modalError}>
              <AlertCircle className={styles.errorIcon} />
              {error}
            </div>
          )}

          <div className={styles.formField}>
            <label className={styles.formLabel}>Nombre completo</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Email</label>
            <input
              type="email"
              className={styles.formInput}
              placeholder="juan@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Contraseña</label>
            <input
              type="password"
              className={styles.formInput}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Rol</label>
            <select
              className={styles.formSelect}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="customer">Cliente</option>
              <option value="staff">Personal</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.modalCancel}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.modalSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className={styles.spinner} />
                  Creando...
                </>
              ) : (
                "Crear Usuario"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de ver usuario
interface ViewUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ user, isOpen, onClose }) => {
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

// Modal de editar usuario
interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("No hay sesión iniciada");
        return;
      }

      const res = await fetch(`${API_URL}/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al actualizar usuario");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Editar Usuario</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X className={styles.modalCloseIcon} />
          </button>
        </div>

        <form className={styles.modalBody} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.modalError}>
              <AlertCircle className={styles.errorIcon} />
              {error}
            </div>
          )}

          <div className={styles.formField}>
            <label className={styles.formLabel}>Nombre completo</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Email</label>
            <input
              type="email"
              className={styles.formInput}
              placeholder="juan@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Rol</label>
            <select
              className={styles.formSelect}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="customer">Cliente</option>
              <option value="staff">Personal</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.modalCancel}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.modalSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className={styles.spinner} />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function UsersPage() {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // El layout ya verifica la sesión - solo necesitamos cargar datos
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUsers = async (page: number = 1) => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError("No hay sesión iniciada");
        return;
      }

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter !== "all") params.append("role", roleFilter);

      console.log("Fetching users from:", `${API_URL}/users?${params.toString()}`);

      const res = await fetch(`${API_URL}/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);

      const text = await res.text();
      console.log("Response text:", text);

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${text}`);
      }

      const data = JSON.parse(text);
      setUsers(data);
      setTotalCount(data.length);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al eliminar usuario");
      }

      fetchUsers(currentPage);
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchUsers(currentPage);
    }
  }, [mounted, currentPage, roleFilter]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setCurrentPage(1);
  };

  const activeFiltersCount = [roleFilter !== "all"].filter(Boolean).length;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Usuarios</h1>
          <p className={styles.pageSubtitle}>
            Gestiona los usuarios del sistema
          </p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.addButton} onClick={() => setShowModal(true)}>
            <Plus className={styles.addIcon} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
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
            <label className={styles.filterLabel}>Rol</label>
            <select
              className={styles.filterSelect}
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="staff">Personal</option>
              <option value="customer">Cliente</option>
            </select>
          </div>

          <button className={styles.clearFilters} onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Results Info */}
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          {totalCount} usuarios encontrados
        </span>
        {activeFiltersCount > 0 && (
          <span className={styles.resultsPage}>
            Página {currentPage} de {totalPages}
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle className={styles.errorBannerIcon} />
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className={styles.loadingState}>
          <Loader2 className={styles.loadingSpinner} />
          <span>Cargando usuarios...</span>
        </div>
      ) : (
        /* Users Table */
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
                        {user.role === "customer" && <User className={styles.roleIcon} />}
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
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          fetchUsers(currentPage);
          setShowModal(false);
        }}
      />

      {/* View User Modal */}
      <ViewUserModal
        user={selectedUser}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedUser(null);
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={selectedUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          fetchUsers(currentPage);
        }}
      />
    </div>
  );
}

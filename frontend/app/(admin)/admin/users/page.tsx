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
} from "lucide-react";
import styles from "./page.module.css";

// Tipos
type UserRole = "admin" | "staff" | "customer";
type UserStatus = "active" | "inactive";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  orders: number;
}

// Datos mock
const generateMockUsers = (): User[] => {
  const roles: UserRole[] = ["admin", "staff", "customer"];
  const firstNames = ["Juan", "María", "Carlos", "Ana", "Pedro", "Laura", "Miguel", "Sofia", "Diego", "Carmen", "Javier", "Isabel", "Fernando", "Patricia", "Roberto", "Claudia", "Alejandro", "Natalia", "Ricardo", "Veronica"];
  const lastNames = ["Pérez", "García", "López", "Martínez", "Sánchez", "Rodríguez", "Torres", "Ramírez", "Flores", "Ruiz", "Hernández", "González", "Mendoza", "Castillo", "Jiménez", "Vargas", "Romero", "Herrera", "Medina", "Cruz"];
  
  return Array.from({ length: 78 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const createdDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    return {
      id: (i + 1).toString(),
      name,
      email,
      role: i < 3 ? "admin" : (i < 10 ? "staff" : "customer"),
      status: i % 7 === 0 ? "inactive" : "active",
      createdAt: createdDate.toISOString().split("T")[0],
      orders: Math.floor(Math.random() * 30),
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const mockUsers = generateMockUsers();

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

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  staff: "Personal",
  customer: "Cliente",
};

const roleClassMap: Record<UserRole, string> = {
  admin: styles.userRoleAdmin,
  staff: styles.userRoleStaff,
  customer: styles.userRoleCustomer,
};

const statusLabels: Record<UserStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
};

const statusClassMap: Record<UserStatus, string> = {
  active: styles.userStatusActive,
  inactive: styles.userStatusInactive,
};

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    roleFilter !== "all",
    statusFilter !== "all",
  ].filter(Boolean).length;

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
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
                setRoleFilter(e.target.value as UserRole | "all");
                setCurrentPage(1);
              }}
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="staff">Personal</option>
              <option value="customer">Cliente</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Estado</label>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as UserStatus | "all");
                setCurrentPage(1);
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
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
          {filteredUsers.length} usuarios encontrados
        </span>
        {activeFiltersCount > 0 && (
          <span className={styles.resultsPage}>
            Página {currentPage} de {totalPages}
          </span>
        )}
      </div>

      {/* Users Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHead}>
              <th className={styles.tableHeadCell}>Usuario</th>
              <th className={styles.tableHeadCell}>Rol</th>
              <th className={styles.tableHeadCell}>Estado</th>
              <th className={`${styles.tableHeadCell} ${styles.tableHeadCellRight}`}>Pedidos</th>
              <th className={styles.tableHeadCell}>Fecha de registro</th>
              <th className={styles.tableHeadCell}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}>
                        <span className={styles.userAvatarText}>{getInitials(user.name)}</span>
                      </div>
                      <div className={styles.userDetails}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.userRole} ${roleClassMap[user.role]}`}>
                      {user.role === "admin" && <Shield className={styles.roleIcon} />}
                      {user.role === "staff" && <Mail className={styles.roleIcon} />}
                      {user.role === "customer" && <User className={styles.roleIcon} />}
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.userStatus} ${statusClassMap[user.status]}`}>
                      {statusLabels[user.status]}
                    </span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                    <span className={styles.userOrders}>{user.orders}</span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.userDate}>
                      {new Date(user.createdAt).toLocaleDateString("es-AR")}
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

      {/* Simple Modal Placeholder */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Nuevo Usuario</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <X className={styles.modalCloseIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>Modal de creación de usuario (placeholder)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

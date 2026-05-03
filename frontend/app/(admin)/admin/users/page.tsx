"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import styles from "./page.module.css";
import { EditUserModal } from "@/features/admin/users/modals/EditUserModal";
import { ViewUserModal } from "@/features/admin/users/modals/ViewUserModal";
import { CreateUserModal } from "@/features/admin/users/modals/CreateUserModal";
import { Pagination } from "@/features/admin/users/Pagination";
import { User } from "@/shared/types";
import { UsersTable } from "@/features/admin/users/UsersTable";

// API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const getToken = (): string | null => {
  return localStorage.getItem("access_token");
};

const ITEMS_PER_PAGE = 10;

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

      const res = await fetch(`${API_URL}/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const text = await res.text();

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
        <UsersTable
          filteredUsers={filteredUsers}
          setSelectedUser={setSelectedUser}
          setShowEditModal={setShowEditModal}
          setShowViewModal={setShowViewModal}
          handleDelete={handleDelete}
        />
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

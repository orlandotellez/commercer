import { Filter, Search } from "lucide-react";
import styles from "./Filters.module.css"
import React from "react";

interface FiltersProps {
  searchTerm: string
  setSearchTerm: (e: React.ChangeEvent<HTMLInputElement>) => void
  setCurrentPage: (value: number) => void
  showFilters: boolean
  setShowFilters: (value: boolean) => void
  activeFiltersCount: number
  roleFilter: string
  setRoleFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void
  clearFilters: () => void
}

export const Filters = ({
  searchTerm,
  setSearchTerm,
  setCurrentPage,
  showFilters,
  setShowFilters,
  activeFiltersCount,
  roleFilter,
  setRoleFilter,
  clearFilters
}: FiltersProps) => {
  return (
    <>
      <div className={styles.filtersSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={() => {
              setSearchTerm;
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
              onChange={() => {
                setRoleFilter;
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
    </>
  )
}

import { Filter, Search } from "lucide-react";
import styles from "./Filters.module.css";
import React from "react";

interface FiltersProps {
  searchTerm: string;
  setSearchTerm: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCurrentPage: (value: number) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  activeFiltersCount: number;
  statusFilter: string;
  setStatusFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  categoryFilter: string;
  setCategoryFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  productCategories: string[];
  clearFilters: () => void;
}

export const Filters = ({
  searchTerm,
  setSearchTerm,
  setCurrentPage,
  showFilters,
  setShowFilters,
  activeFiltersCount,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  productCategories,
  clearFilters
}: FiltersProps) => {
  return (
    <>
      <div className={styles.filtersSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e);
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
            <label className={styles.filterLabel}>Estado</label>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e);
                setCurrentPage(1);
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Categoría</label>
            <select
              className={styles.filterSelect}
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e);
                setCurrentPage(1);
              }}
            >
              <option value="all">Todas las categorías</option>
              {productCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <button className={styles.clearFilters} onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      )}
    </>
  );
};

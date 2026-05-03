import { Calendar, Filter, Search } from "lucide-react";
import styles from "./Filters.module.css"
import React from "react";

interface FiltersProps {
  searchTerm: string
  setSearchTerm: (e: React.ChangeEvent<HTMLInputElement>) => void
  setCurrentPage: (value: number) => void
  showFilters: boolean
  setShowFilters: (value: boolean) => void
  activeFiltersCount: number
  statusFilter: string
  setStatusFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void
  dateFrom: string
  setDateFrom: (e: React.ChangeEvent<HTMLInputElement>) => void
  dateTo: string
  setDateTo: (e: React.ChangeEvent<HTMLInputElement>) => void
  clearFilters: () => void
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
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  clearFilters
}: FiltersProps) => {
  return (
    <>
      <div className={styles.filtersSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por ID, cliente o email..."
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
            <label className={styles.filterLabel}>Estado</label>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={() => {
                setStatusFilter;
                setCurrentPage(1);
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="processing">Procesando</option>
              <option value="shipped">Enviado</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Desde</label>
            <div className={styles.dateInputWrapper}>
              <Calendar className={styles.dateIcon} />
              <input
                type="date"
                className={styles.filterInput}
                value={dateFrom}
                onChange={() => {
                  setDateFrom;
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Hasta</label>
            <div className={styles.dateInputWrapper}>
              <Calendar className={styles.dateIcon} />
              <input
                type="date"
                className={styles.filterInput}
                value={dateTo}
                onChange={() => {
                  setDateTo;
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <button className={styles.clearFilters} onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      )}
    </>
  )
}

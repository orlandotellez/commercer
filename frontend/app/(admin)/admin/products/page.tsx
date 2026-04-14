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
  Package,
  X,
} from "lucide-react";
import styles from "./page.module.css";

// Tipos
type ProductStatus = "active" | "inactive";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
  status: ProductStatus;
  image?: string;
}

// Datos mock
const generateMockProducts = (): Product[] => {
  const categories = ["Componentes", "Periféricos", "Almacenamiento", "Memoria", "Tarjetas Gráficas", "Procesadores"];
  const products = [
    "NVIDIA RTX 5090",
    "AMD Ryzen 9 9950X",
    "Corsair Vengeance 32GB",
    "Samsung 990 Pro 2TB",
    "ASUS ROG Maximus Z790",
    " Kingston Fury Beast 64GB",
    "Western Digital Black SN850X",
    "Intel Core i9-14900K",
    "Corsair Dominator Platinum 32GB",
    "Seagate FireCuda 530 1TB",
    "MSI MEG Z790 ACE",
    "G.Skill Trident Z5 64GB",
    "Crucial T700 1TB",
    "ASUS TUF Gaming GeForce RTX 5080",
    "AMD Ryzen 7 9800X3D",
  ];

  return Array.from({ length: 65 }, (_, i) => {
    const baseProduct = products[i % products.length];
    const price = Math.floor(Math.random() * 2000) + 50;
    const stock = Math.floor(Math.random() * 100);
    
    return {
      id: (i + 1).toString(),
      name: `${baseProduct}${i >= 15 ? ` Gen${Math.floor(i / 15) + 1}` : ""}`,
      sku: `SKU-${1000 + i}`,
      category: categories[i % categories.length],
      stock,
      price,
      status: i % 5 === 0 ? "inactive" : "active",
    };
  });
};

const mockProducts = generateMockProducts();

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

const statusLabels: Record<ProductStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
};

const statusClassMap: Record<ProductStatus, string> = {
  active: styles.productStatusActive,
  inactive: styles.productStatusInactive,
};

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set(mockProducts.map(p => p.category))];
    return unique.sort();
  }, []);

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchTerm, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    statusFilter !== "all",
    categoryFilter !== "all",
  ].filter(Boolean).length;

  const getStockClass = (stock: number) => {
    if (stock === 0) return styles.stockEmpty;
    if (stock <= 10) return styles.stockLow;
    if (stock <= 30) return styles.stockMedium;
    return styles.stockHigh;
  };

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Productos</h1>
          <p className={styles.pageSubtitle}>
            Gestiona el inventario de tu tienda
          </p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.addButton} onClick={() => setShowModal(true)}>
            <Plus className={styles.addIcon} />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
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
            <label className={styles.filterLabel}>Estado</label>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ProductStatus | "all");
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
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
          {filteredProducts.length} productos encontrados
        </span>
        {activeFiltersCount > 0 && (
          <span className={styles.resultsPage}>
            Página {currentPage} de {totalPages}
          </span>
        )}
      </div>

      {/* Products Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHead}>
              <th className={styles.tableHeadCell}>Producto</th>
              <th className={styles.tableHeadCell}>SKU</th>
              <th className={styles.tableHeadCell}>Categoría</th>
              <th className={`${styles.tableHeadCell} ${styles.tableHeadCellRight}`}>Precio</th>
              <th className={`${styles.tableHeadCell} ${styles.tableHeadCellCenter}`}>Stock</th>
              <th className={styles.tableHeadCell}>Estado</th>
              <th className={styles.tableHeadCell}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr key={product.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.productInfo}>
                      <div className={styles.productIcon}>
                        <Package className={styles.productIconSvg} />
                      </div>
                      <span className={styles.productName}>{product.name}</span>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.productSku}>{product.sku}</span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.productCategory}>{product.category}</span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                    <span className={styles.productPrice}>
                      ${product.price.toLocaleString("es-AR")}
                    </span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                    <div className={styles.stockWrapper}>
                      <span className={`${styles.stockValue} ${getStockClass(product.stock)}`}>
                        {product.stock}
                      </span>
                      <div className={styles.stockBar}>
                        <div
                          className={`${styles.stockBarFill} ${getStockClass(product.stock)}`}
                          style={{
                            width: `${Math.min((product.stock / 100) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.productStatus} ${statusClassMap[product.status]}`}>
                      {statusLabels[product.status]}
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
              <h2 className={styles.modalTitle}>Nuevo Producto</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <X className={styles.modalCloseIcon} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>Modal de creación de producto (placeholder)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

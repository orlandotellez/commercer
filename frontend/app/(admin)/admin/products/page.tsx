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
  Loader2,
  Database,
  Upload,
  Folder,
} from "lucide-react";
import styles from "./page.module.css";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  generateSlug,
  listCategories,
  createCategory,
  CreateProductPayload,
  ProductResponse,
  CategoryResponse,
  seedCategories,
} from "@/shared/lib/api";
import { products as sampleProducts } from "@/features/product/data/products";

// Tipos locales para el admin
type ProductStatus = "active" | "inactive";

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId?: string;
  stock: number;
  price: number;
  originalPrice?: number;
  status: ProductStatus;
  image?: string;
  brand?: string;
  description?: string;
  featured: boolean;
}

const ITEMS_PER_PAGE = 10;

const statusLabels: Record<ProductStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
};

const statusClassMap: Record<ProductStatus, string> = {
  active: styles.productStatusActive,
  inactive: styles.productStatusInactive,
};

// Map de categorías del sistema
const categoryMap: Record<string, string> = {
  "Procesadores": "cpu",
  "Tarjetas Gráficas": "gpu",
  "Memoria": "ram",
  "Almacenamiento": "storage",
  "Placas Madre": "motherboard",
  "Fuentes de Poder": "psu",
  "Monitores": "monitor",
  "Periféricos": "peripherals",
  "Accesorios PC": "accessories",
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
}

// Modal de ver producto
const ViewProductModal: React.FC<{
  product: AdminProduct | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ product, isOpen, onClose }) => {
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
            <span className={styles.detailValue}>{product.status === "active" ? "Activo" : "Inactivo"}</span>
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

export default function ProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  // Datos del formulario
  const [formData, setFormData] = useState<Partial<CreateProductPayload>>({
    name: "",
    slug: "",
    description: "",
    price: 0,
    original_price: undefined,
    image: "",
    category_id: undefined,
    brand: "",
    stock: 0,
    active: true,
    featured: false,
  });

  useEffect(() => {
    setMounted(true);
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await listCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleSeedCategories = async () => {
    try {
      setSeeding(true);
      for (const cat of seedCategories) {
        await createCategory(cat);
      }
      await fetchCategories();
      alert("Categorías creadas");
    } catch (err) {
      console.error("Error seeding categories:", err);
      alert("Error al crear categorías");
    } finally {
      setSeeding(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listProducts({ limit: 100 });
      setProducts(
        data.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category_id || "sin-categoria",
          stock: p.stock,
          price: p.price,
          originalPrice: p.original_price,
          status: p.active ? "active" : "inactive",
          image: p.image,
          brand: p.brand,
          description: p.description,
          featured: p.featured,
        }))
      );
    } catch (err) {
      setError("Error al cargar productos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedProducts = async () => {
    if (categories.length === 0) {
      alert("Primero debés crear las categorías");
      return;
    }

    if (!confirm("¿Agregar productos de prueba? Esto puede duplicar productos existentes.")) {
      return;
    }

    try {
      setSeeding(true);
      let addedCount = 0;

      for (const p of sampleProducts) {
        const slug = generateSlug(p.name);
        
        // Buscar categoría por slug
        const catSlug = categoryMap[p.category] || "sin-categoria";
        const category = categories.find(c => c.slug === catSlug);

        const payload: CreateProductPayload = {
          name: p.name,
          slug,
          description: p.description,
          price: p.price,
          original_price: p.originalPrice,
          image: p.image,
          category_id: category?.id,
          brand: p.brand,
          stock: p.stock,
          specs: p.specs,
          active: true,
          featured: p.featured,
        };

        await createProduct(payload);
        addedCount++;
      }

      alert(`Se agregaron ${addedCount} productos de prueba`);
      await fetchProducts();
    } catch (err) {
      console.error("Error seeding products:", err);
      alert("Error al agregar productos de prueba");
    } finally {
      setSeeding(false);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      alert("Nombre y precio son requeridos");
      return;
    }

    try {
      const slug = formData.slug || generateSlug(formData.name);
      
      const payload: CreateProductPayload = {
        name: formData.name,
        slug,
        description: formData.description,
        price: formData.price,
        original_price: formData.original_price,
        image: formData.image,
        category_id: formData.category_id,
        brand: formData.brand,
        stock: formData.stock || 0,
        active: formData.active,
        featured: formData.featured,
      };

      await createProduct(payload);
      setShowModal(false);
      resetForm();
      await fetchProducts();
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Error al crear producto");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) {
      return;
    }

    try {
      await deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Error al eliminar producto");
    }
  };

  const handleSubmitEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !selectedProduct) {
      alert("Nombre y precio son requeridos");
      return;
    }

    setIsEditing(true);

    try {
      const slug = formData.slug || generateSlug(formData.name);
      
      const payload: Partial<CreateProductPayload> = {
        name: formData.name,
        slug,
        description: formData.description,
        price: formData.price,
        original_price: formData.original_price,
        image: formData.image,
        category_id: formData.category_id,
        brand: formData.brand,
        stock: formData.stock,
        active: formData.active,
        featured: formData.featured,
      };

      await updateProduct(selectedProduct.id, payload);
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
      await fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Error al actualizar producto");
    } finally {
      setIsEditing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: 0,
      original_price: undefined,
      image: "",
      category_id: undefined,
      brand: "",
      stock: 0,
      active: true,
      featured: false,
    });
  };

  const productCategories = useMemo(() => {
    const unique = [...new Set(products.map(p => p.category))];
    return unique.sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.slug.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchTerm, statusFilter, categoryFilter]);

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
          <button 
            className={styles.categoryButton}
            onClick={handleSeedCategories}
            disabled={seeding || categories.length > 0}
            title={categories.length > 0 ? "Ya hay categorías" : "Crear las 9 categorías"}
          >
            <Folder className={styles.addIcon} />
            Crear Categorías
          </button>
          <button 
            className={styles.seedButton} 
            onClick={handleSeedProducts}
            disabled={seeding || categories.length === 0}
          >
            {seeding ? (
              <Loader2 className={styles.addIcon} />
            ) : (
              <Database className={styles.addIcon} />
            )}
            Agregar Productos de Prueba
          </button>
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
              <th className={styles.tableHeadCell}>Categoría</th>
              <th className={`${styles.tableHeadCell} ${styles.tableHeadCellRight}`}>Precio</th>
              <th className={`${styles.tableHeadCell} ${styles.tableHeadCellCenter}`}>Stock</th>
              <th className={styles.tableHeadCell}>Estado</th>
              <th className={styles.tableHeadCell}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  <Loader2 className={styles.spinner} />
                  Cargando productos...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  {error}
                </td>
              </tr>
            ) : paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr key={product.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.productInfo}>
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className={styles.productImage}
                        />
                      ) : (
                        <div className={styles.productIcon}>
                          <Package className={styles.productIconSvg} />
                        </div>
                      )}
                      <div>
                        <span className={styles.productName}>{product.name}</span>
                        {product.brand && (
                          <span className={styles.productBrand}>{product.brand}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.productCategory}>{product.category}</span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                    <div className={styles.priceWrapper}>
                      <span className={styles.productPrice}>
                        ${product.price.toLocaleString("es-AR")}
                      </span>
                      {product.originalPrice && (
                        <span className={styles.originalPrice}>
                          ${product.originalPrice.toLocaleString("es-AR")}
                        </span>
                      )}
                    </div>
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
                      <button 
                        className={styles.actionButton} 
                        title="Ver detalles"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowViewModal(true);
                        }}
                      >
                        <Eye className={styles.actionIcon} />
                      </button>
                      <button 
                        className={styles.actionButton} 
                        title="Editar"
                        onClick={() => {
                          setSelectedProduct(product);
                          setFormData({
                            name: product.name,
                            slug: product.slug,
                            description: product.description || "",
                            price: product.price,
                            original_price: product.originalPrice,
                            stock: product.stock,
                            category_id: product.categoryId,
                            brand: product.brand,
                            active: product.status === "active",
                            featured: product.featured,
                          });
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className={styles.actionIcon} />
                      </button>
                      <button 
                        className={`${styles.actionButton} ${styles.actionButtonDanger}`} 
                        title="Eliminar"
                        onClick={() => handleDeleteProduct(product.id)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create Product Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Nuevo Producto</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <X className={styles.modalCloseIcon} />
              </button>
            </div>
            <form onSubmit={handleSubmitProduct} className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nombre *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Slug</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Se genera automáticamente"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.formInput}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Precio Original</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.formInput}
                    value={formData.original_price || ""}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Stock</label>
                  <input
                    type="number"
                    min="0"
                    className={styles.formInput}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Marca</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Categoría</label>
                  <select
                    className={styles.formSelect}
                    value={formData.category_id || ""}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value || undefined })}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>URL de Imagen</label>
                  <input
                    type="url"
                    className={styles.formInput}
                    value={formData.image || ""}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descripción</label>
                <textarea
                  className={styles.formTextarea}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className={styles.formCheckboxes}>
                <label className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    checked={formData.active ?? true}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span>Activo</span>
                </label>

                <label className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    checked={formData.featured ?? false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>Destacado</span>
                </label>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.submitButton}>
                  <Upload className={styles.addIcon} />
                  Crear Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      <ViewProductModal
        product={selectedProduct}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedProduct(null);
        }}
      />

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Editar Producto</h2>
              <button className={styles.modalClose} onClick={() => setShowEditModal(false)}>
                <X className={styles.modalCloseIcon} />
              </button>
            </div>
            <form onSubmit={handleSubmitEditProduct} className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nombre *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Slug</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.formInput}
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Precio Original</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.formInput}
                    value={formData.original_price || ""}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Stock</label>
                  <input
                    type="number"
                    min="0"
                    className={styles.formInput}
                    value={formData.stock || 0}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Marca</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.brand || ""}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Categoría</label>
                  <select
                    className={styles.formSelect}
                    value={formData.category_id || ""}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
                <label className={styles.formLabel}>Descripción</label>
                <textarea
                  className={styles.formTextarea}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    checked={formData.active ?? true}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span>Activo</span>
                </label>

                <label className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    checked={formData.featured ?? false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>Destacado</span>
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalCancel}
                  onClick={() => setShowEditModal(false)}
                  disabled={isEditing}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.modalSubmit} disabled={isEditing}>
                  {isEditing ? (
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
      )}
    </div>
  );
}

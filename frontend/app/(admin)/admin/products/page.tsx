"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import { Header } from "@/features/admin/products/Header";
import { Filters } from "@/features/admin/products/Filters";
import { ResultsInfo } from "@/features/admin/products/ResultsInfo";
import { ProductsTable } from "@/features/admin/products/ProductsTable";
import { Pagination } from "@/features/admin/products/Pagination";
import { ViewProductModal } from "@/features/admin/products/modals/ViewProductModal";
import { CreateProductModal } from "@/features/admin/products/modals/CreateProductModal";
import { EditProductModal } from "@/features/admin/products/modals/EditProductModal";
import { useCategories } from "@/shared/hooks/useCategories";
import { useProducts } from "@/shared/hooks/useProducts";
import { AdminProduct, CreateProductPayload } from "@/shared/types";
import { ErrorState } from "@/shared/components/ErrorState";
import { LoadingState } from "@/shared/components/LoadingState";

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);

  // Data states
  const { products, fetchProducts, loading, error, handleSeedProducts, handleCreate, handleUpdate, handleDelete } = useProducts();
  const { categories, fetchCategories, seeding, handleSeedCategories } = useCategories();

  useEffect(() => {
    setMounted(true);
    fetchProducts();
    fetchCategories();
  }, []);

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

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <Header
        onSeedCategories={handleSeedCategories}
        onSeedProducts={() => handleSeedProducts(categories)}
        onCreateProduct={() => setShowCreateModal(true)}
        seeding={seeding}
        categoriesCount={categories.length}
      />

      {/* Filters Section */}
      <Filters
        searchTerm={searchTerm}
        setSearchTerm={(e) => setSearchTerm(e.target.value)}
        setCurrentPage={setCurrentPage}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        statusFilter={statusFilter}
        setStatusFilter={(e) => setStatusFilter(e.target.value as any)}
        categoryFilter={categoryFilter}
        setCategoryFilter={(e) => setCategoryFilter(e.target.value)}
        productCategories={productCategories}
        clearFilters={clearFilters}
      />

      {/* Results Info */}
      <ResultsInfo
        filteredCount={filteredProducts.length}
        totalPages={totalPages}
        currentPage={currentPage}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Error State */}
      {error && <ErrorState error={error} fetch={() => fetchProducts()} />}

      {loading && <LoadingState title="Cargando products..." />}

      {/* Products Table */}
      {!loading && !error &&
        <ProductsTable
          products={paginatedProducts}
          onView={(product) => {
            setSelectedProduct(product);
            setShowViewModal(true);
          }}
          onEdit={(product) => {
            setSelectedProduct(product);
            setShowEditModal(true);
          }}
          onDelete={handleDelete}
          loading={loading}
          error={error}
        />}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={async (payload: CreateProductPayload) => {
          await handleCreate(payload);
          setShowCreateModal(false);
        }}
        categories={categories}
        onSubmit={handleCreate}
      />

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
      <EditProductModal
        product={selectedProduct}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onSuccess={async () => {
          await fetchProducts();
        }}
        categories={categories}
        onSubmit={handleUpdate}
      />
    </div>
  );
}

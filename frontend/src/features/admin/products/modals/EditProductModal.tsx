import { AdminProduct } from "@/shared/types";
import styles from "./Modal.module.css";
import { X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CategoryResponse, CreateProductPayload } from "@/shared/lib/api";

interface EditProductModalProps {
  product: AdminProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: CategoryResponse[];
  onSubmit: (id: string, payload: Partial<CreateProductPayload>) => Promise<void>;
}

export const EditProductModal = ({
  product,
  isOpen,
  onClose,
  onSuccess,
  categories,
  onSubmit
}: EditProductModalProps) => {
  const [formData, setFormData] = useState<Partial<CreateProductPayload>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
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
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert("Nombre y precio son requeridos");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(product.id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Error al actualizar producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Editar Producto</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X className={styles.modalCloseIcon} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalBody}>
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

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.modalCancel}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.modalSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
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

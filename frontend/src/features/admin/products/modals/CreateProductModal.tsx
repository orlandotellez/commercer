import styles from "./Modal.module.css";
import { X, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateProductPayload, CategoryResponse } from "@/shared/lib/api";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: CreateProductPayload) => Promise<void>;
  categories: CategoryResponse[];
  onSubmit: (payload: CreateProductPayload) => Promise<void>;
}

export const CreateProductModal = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  onSubmit
}: CreateProductModalProps) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert("Nombre y precio son requeridos");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData as CreateProductPayload);
      onSuccess;
      onClose();
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Error al crear producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Nuevo Producto</h2>
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

          <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
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
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              <Upload className={styles.modalCloseIcon} />
              {isSubmitting ? "Creando..." : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

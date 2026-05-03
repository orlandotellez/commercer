import { AdminProduct } from "@/shared/types";
import styles from "./ProductsTable.module.css"
import { Eye, Edit, Trash2, Package, Loader2 } from "lucide-react";

interface ProductsTableProps {
  products: AdminProduct[];
  onView: (product: AdminProduct) => void;
  onEdit: (product: AdminProduct) => void;
  onDelete: (id: string) => void;
  loading: boolean;
  error: string | null;
}

const statusLabels: Record<string, string> = {
  active: "Activo",
  inactive: "Inactivo",
};

const statusClassMap: Record<string, string> = {
  active: styles.productStatusActive,
  inactive: styles.productStatusInactive,
};

const getStockClass = (stock: number) => {
  if (stock === 0) return styles.stockEmpty;
  if (stock <= 10) return styles.stockLow;
  if (stock <= 30) return styles.stockMedium;
  return styles.stockHigh;
};

export const ProductsTable = ({
  products,
  onView,
  onEdit,
  onDelete,
  loading,
  error
}: ProductsTableProps) => {
  if (loading) {
    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td colSpan={6} className={styles.emptyState}>
                <Loader2 className={styles.spinner} />
                Cargando productos...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td colSpan={6} className={styles.emptyState}>
                {error}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
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
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles.emptyState}>
                No se encontraron productos
              </td>
            </tr>
          ) : (
            products.map((product) => (
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
                      onClick={() => onView(product)}
                    >
                      <Eye className={styles.actionIcon} />
                    </button>
                    <button
                      className={styles.actionButton}
                      title="Editar"
                      onClick={() => onEdit(product)}
                    >
                      <Edit className={styles.actionIcon} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                      title="Eliminar"
                      onClick={() => onDelete(product.id)}
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
  );
};



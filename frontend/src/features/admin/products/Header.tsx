import styles from "./Header.module.css";
import { Plus, Database, Folder, Loader2 } from "lucide-react";

interface HeaderProps {
  onSeedCategories: () => void;
  onSeedProducts: () => void;
  onCreateProduct: () => void;
  seeding: boolean;
  categoriesCount: number;
}

export const Header = ({ 
  onSeedCategories, 
  onSeedProducts, 
  onCreateProduct, 
  seeding, 
  categoriesCount 
}: HeaderProps) => {
  return (
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
          onClick={onSeedCategories}
          disabled={seeding || categoriesCount > 0}
          title={categoriesCount > 0 ? "Ya hay categorías" : "Crear las 9 categorías"}
        >
          <Folder className={styles.addIcon} />
          Crear Categorías
        </button>
        <button 
          className={styles.seedButton} 
          onClick={onSeedProducts}
          disabled={seeding || categoriesCount === 0}
        >
          {seeding ? (
            <Loader2 className={styles.addIcon} />
          ) : (
            <Database className={styles.addIcon} />
          )}
          Agregar Productos de Prueba
        </button>
        <button className={styles.addButton} onClick={onCreateProduct}>
          <Plus className={styles.addIcon} />
          Nuevo Producto
        </button>
      </div>
    </div>
  );
};

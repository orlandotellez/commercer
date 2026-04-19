import { Category, Product } from "@/shared/types";
import styles from "./Sidebar.module.css"

type rangeNumber = [number, number]

interface SidebarProps {
  categories: Category[]
  products: Product[]
  categorySlug: string | null
  priceRange: rangeNumber
  brands: string[]
  updateCategory: (slug?: string) => void
  setPriceRange: ([]: rangeNumber) => void
}

export const Sidebar = ({
  categories,
  products,
  categorySlug,
  priceRange,
  brands,
  updateCategory,
  setPriceRange
}: SidebarProps) => {
  console.log(categories)
  console.log(products)
  return (
    <>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Categories */}
        <div>
          <h3 className={styles.title}>Categorías</h3>

          <ul className={styles.list}>
            <li>
              <button
                onClick={() => updateCategory()}
                className={
                  !categorySlug
                    ? styles.activeBtn
                    : styles.inactiveBtn
                }
              >
                Todos ({products.length})
              </button>
            </li>

            {categories.map((cat) => {
              const count = products.filter(
                (p) => p.category === cat.slug
              ).length;

              return (
                <li key={cat.id}>
                  <button
                    onClick={() => updateCategory(cat.slug)}
                    className={
                      categorySlug === cat.slug
                        ? styles.activeBtn
                        : styles.inactiveBtn
                    }
                  >
                    {cat.name} ({count})
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Price */}
        <div className={styles.priceContainer}>
          <h3 className={styles.title}>Precio</h3>

          <div className={styles.priceList}>
            {[[0, 100], [100, 300], [300, 600], [600, 1000], [1000, 2000]].map(
              ([min, max]) => (
                <button
                  key={`${min}-${max}`}
                  onClick={() => setPriceRange([min, max])}
                  className={
                    priceRange[0] === min && priceRange[1] === max
                      ? styles.activeBtn
                      : styles.inactiveBtn
                  }
                >
                  ${min} - ${max}
                </button>
              )
            )}

            <button
              onClick={() => setPriceRange([0, 2000])}
              className={styles.clear}
            >
              Limpiar filtro
            </button>
          </div>
        </div>

        {/* Brands */}
        <div>
          <h3 className={styles.title}>Marcas</h3>

          <ul className={styles.list}>
            {brands.map((brand) => (
              <li key={brand} className={styles.brand}>
                {brand}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  )
}

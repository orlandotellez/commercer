import { Product } from "@/shared/types"
import { ProductCard } from "./ProductCard"
import styles from "./ProductRelated.module.css"

interface ProductRelatedProps {
  related: Product[]
}

export const ProductRelated = ({ related }: ProductRelatedProps) => {
  return (
    <>
      {related.length > 0 && (
        <section className={styles.related}>
          <h2>Productos Relacionados</h2>

          <div className={styles.grid}>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

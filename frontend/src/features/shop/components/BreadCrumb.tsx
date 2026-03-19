import Link from "next/link"
import styles from "./BreadCrumb.module.css"
import { Category, Product } from "@/shared/types"

interface BreadcrumbProps {
  activeCategory: Category | undefined
}

export const BreadCrumb = ({ activeCategory }: BreadcrumbProps) => {
  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link>
        <span>/</span>
        <span className={styles.active}>
          {activeCategory?.name || 'Todos los Productos'}
        </span>
      </div>

    </>
  )
}


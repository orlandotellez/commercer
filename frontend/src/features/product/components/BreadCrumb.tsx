import Link from "next/link"
import styles from "./BreadCrumb.module.css"
import { Product } from "@/shared/types"

interface BreadcrumbProps {
  product: Product
}

export const BreadCrumb = ({ product }: BreadcrumbProps) => {
  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/">Inicio</Link>
        <p>/</p>
        <Link href="/shop">Tienda</Link>
        <p>/</p>
        <span>{product.name}</span>
      </div>
    </>
  )
}


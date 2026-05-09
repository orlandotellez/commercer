import { Download } from "lucide-react"
import * as XLSX from "xlsx"
import styles from "./Header.module.css"
import { Order, OrderStatus } from "@/shared/types"

interface HeaderProps {
  orders: Order[]
  statusLabels: Record<OrderStatus, string>
}

export const Header = ({ orders, statusLabels }: HeaderProps) => {

  const handleExport = () => {
    const data = orders.map((order) => ({
      ID: order.id,
      Cliente: order.customer,
      Email: order.email,
      Fecha: new Date(order.date).toLocaleDateString("es-AR"),
      Items: order.items,
      Total: order.total,
      Estado: statusLabels[order.status],
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos")

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 30 },
      { wch: 12 },
      { wch: 8 },
      { wch: 12 },
      { wch: 12 },
    ]

    XLSX.writeFile(workbook, `pedidos-${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Pedidos</h1>
          <p className={styles.pageSubtitle}>
            Gestiona todos los pedidos de tu tienda
          </p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.exportButton} onClick={handleExport}>
            <Download className={styles.exportIcon} />
            Exportar
          </button>
        </div>
      </div>
    </>
  )
}

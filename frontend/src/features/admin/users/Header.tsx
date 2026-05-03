import { Plus } from "lucide-react"
import styles from "./Header.module.css"

interface HeaderProps {
  setShowModal: (value: boolean) => void
}

export const Header = ({ setShowModal }: HeaderProps) => {
  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Usuarios</h1>
          <p className={styles.pageSubtitle}>
            Gestiona los usuarios del sistema
          </p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.addButton} onClick={() => setShowModal(true)}>
            <Plus className={styles.addIcon} />
            Nuevo Usuario
          </button>
        </div>
      </div>
    </>
  )
}


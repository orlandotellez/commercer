import { AlertCircle } from "lucide-react"
import styles from "./ErrorState.module.css"

interface ErrorState {
  error: string
  fetch: () => void
}

export const ErrorState = ({ error, fetch }: ErrorState) => {
  return (
    <>
      <div className={styles.errorState}>
        <AlertCircle className={styles.errorIcon} />
        <span>{error}</span>
        <button onClick={fetch} className={styles.retryButton}>
          Reintentar
        </button>
      </div>

    </>
  )
}


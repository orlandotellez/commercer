import { Loader2 } from "lucide-react"
import styles from "./LoadingState.module.css"

interface LoadingStateProps {
  title: string
}

export const LoadingState = ({ title }: LoadingStateProps) => {
  return (
    <>
      <div className={styles.loadingState}>
        <Loader2 className={styles.loadingSpinner} />
        <span>{title}</span>
      </div>
    </>
  )
}


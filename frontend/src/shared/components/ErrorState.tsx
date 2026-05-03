import { AlertCircle } from "lucide-react"
import styles from "./ErrorState.module.css"

interface ErrorState {
  error: string
}

export const ErrorState = ({ error }: ErrorState) => {
  return (
    <>
      <div className={styles.errorBanner}>
        <AlertCircle className={styles.errorBannerIcon} />
        {error}
      </div>
    </>
  )
}


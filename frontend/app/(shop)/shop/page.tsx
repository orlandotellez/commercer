import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ShopClient from './ShopClient';
import styles from './page.module.css';

export default function Page() {
  return (
    <Suspense fallback={
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} />
      </div>
    }>
      <ShopClient />
    </Suspense>
  );
}

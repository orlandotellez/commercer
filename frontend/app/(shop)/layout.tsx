import { StoreNavbar } from '@/shared/components/StoreNavbar';
import styles from "./layout.module.css"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <StoreNavbar />
      <main>{children}</main>
    </div>
  );
}

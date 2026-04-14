'use client';

import styles from './layout.module.css';

interface AuthLayout {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayout) {
  return (
    <div className={styles.container}>
      {children}
    </div>
  );
}
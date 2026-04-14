"use client"

import styles from "./layout.module.css";
import { SideBar } from "@/features/admin/Sidebar";
import { useSideBarStore } from "@/shared/store/useSidebarStore";


interface DashboardLayout {
  children: React.ReactNode;
}

export default function ShopLayout({ children }: DashboardLayout) {
  const { collapsed } = useSideBarStore();
  return (
    <>
      <div
        className={`${styles.container} ${collapsed ? styles.collapsed : styles.expanded
          }`}
      >
        <SideBar />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </>
  );
};

"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./layout.module.css";
import { SideBar } from "@/features/admin/Sidebar";
import { useSideBarStore } from "@/shared/store/useSidebarStore";
import { Loader2 } from "lucide-react";

interface DashboardLayout {
  children: React.ReactNode;
}

export default function ShopLayout({ children }: DashboardLayout) {
  const router = useRouter();
  const { collapsed } = useSideBarStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión
    const token = localStorage.getItem('access_token');

    if (!token) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <Loader2 style={{ width: 24, height: 24, animation: 'spin 1s linear infinite', color: '#6B7280' }} />
      </div>
    );
  }

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

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
    // Verificar sesión y rol
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    // Verificar rol del usuario
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Solo staff y admin pueden acceder al admin
        if (user.role === 'customer') {
          router.push('/');
          return;
        }
      } catch {
        router.push('/login');
        return;
      }
    }

    setIsLoading(false);
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

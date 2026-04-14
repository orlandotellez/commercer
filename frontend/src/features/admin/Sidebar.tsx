"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LayoutDashboard, Package, Settings, ShoppingCart, Users } from "lucide-react";
import { useSideBarStore } from "@/shared/store/useSidebarStore";
import styles from "./Sidebar.module.css"


export const SideBar = () => {
  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
    { path: "/admin/products", label: "Productos", icon: Package },
    { path: "/admin/users", label: "Usuarios", icon: Users },
    { path: "/admin/settings", label: "Configuración", icon: Settings },
  ];


  const { collapsed, setCollapsed } = useSideBarStore();

  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : styles.expanded
        }`}
    >
      {/* Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <LayoutDashboard className={styles.iconLarge} />
        </div>

        {!collapsed && (
          <div className={styles.logoText}>
            <h1>Techcomponents</h1>
            <p>Panel de administración</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`${styles.navItem} ${isActive ? styles.active : ""
                } ${collapsed ? styles.isCollapsedIcon : ""}`}
            >
              <Icon />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className={styles.collapseContainer}>
        <button onClick={setCollapsed} className={styles.collapseButton}>
          {collapsed ? (
            <ChevronRight className={styles.icon} />
          ) : (
            <>
              <ChevronLeft className={styles.icon} />
              <span className={styles.collapseText}>Colapsar</span>
            </>
          )}
        </button>
      </div>

    </aside>
  );
};

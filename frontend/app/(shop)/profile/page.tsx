'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { getCurrentUser } from '@/shared/api/users';
import { listOrders } from '@/shared/api/orders';
import { UserProfile, OrderResponse } from '@/shared/types';
import { LogOut, ChevronDown, ChevronUp, LayoutDashboard } from 'lucide-react';
import styles from './page.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user: authUser, logout } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchData() {
      if (!isAuthenticated || authLoading) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const userData = await getCurrentUser();
        setUser(userData);

        // Fetch orders for this user
        const ordersData = await listOrders({ user_id: userData.id });
        setOrders(ordersData.orders || []);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Error al cargar los datos del perfil');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isAuthenticated, authLoading]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      paid: 'Pagado',
      processing: 'Procesando',
      shipped: 'Enviado',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  if (authLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  const isAdmin = authUser?.role === 'admin' || user?.role === 'admin';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mi Perfil</h1>

        <div className={styles.actions}>
          {isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className={styles.dashboardBtn}
            >
              <LayoutDashboard size={18} />
              Ir a Dashboard
            </button>
          )}
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {user && (
        <div className={styles.profileCard}>
          <div className={styles.profileInfo}>
            <p className={styles.label}>Nombre:</p>
            <p className={styles.value}>{user.name}</p>
          </div>
          <div className={styles.profileInfo}>
            <p className={styles.label}>Email:</p>
            <p className={styles.value}>{user.email}</p>
          </div>
        </div>
      )}

      <h2 className={styles.subtitle}>Mis Pedidos</h2>

      {orders.length === 0 ? (
        <div className={styles.empty}>No tienes pedidos aún</div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div
                className={styles.orderHeader}
                onClick={() => toggleOrderExpand(order.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.orderHeaderLeft}>
                  <span className={styles.orderId}>#{order.id.slice(0, 8)}</span>
                  <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                {expandedOrders.has(order.id) ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>

              <div className={styles.orderDetails}>
                <p>Fecha: {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</p>
                <p className={styles.orderTotal}>Total: ${order.total?.toFixed(2)}</p>
              </div>

              {expandedOrders.has(order.id) && order.items && order.items.length > 0 && (
                <div className={styles.orderItems}>
                  <h4 className={styles.itemsTitle}>Productos:</h4>
                  <ul className={styles.itemsList}>
                    {order.items.map((item, idx) => (
                      <li key={idx} className={styles.item}>
                        <span className={styles.itemName}>
                          {item.product_name || 'Producto'} x{item.quantity}
                        </span>
                        <span className={styles.itemPrice}>${item.subtotal?.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.orderSummary}>
                    <div className={styles.summaryRow}>
                      <span>Subtotal:</span>
                      <span>${order.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>IVA:</span>
                      <span>${order.taxes?.toFixed(2)}</span>
                    </div>
                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                      <span>Total:</span>
                      <span>${order.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

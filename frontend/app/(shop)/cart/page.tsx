'use client';

import { useCart } from '@/features/cart/context/CartContext';
import styles from './page.module.css';
import { EmptyCart } from '@/features/cart/components/EmptyCart';
import { ItemsCart } from '@/features/cart/components/ItemsCart';
import { Summary } from '@/features/cart/components/Summary';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, tax, total } = useCart();

  if (items.length === 0) {
    return <EmptyCart />
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Carrito de Compras ({items.length} productos)
      </h1>

      <div className={styles.grid}>
        {/* Items */}
        <ItemsCart
          items={items}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
        />

        {/* Summary */}
        <Summary
          subtotal={subtotal}
          tax={tax}
          total={total}
        />
      </div>
    </div>
  );
};

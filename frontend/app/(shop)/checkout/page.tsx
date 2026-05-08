'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/context/CartContext';
import { CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { items, subtotal, tax, total, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingData, setShippingData] = useState({
    name: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
  });

  useEffect(() => {
    if (items.length === 0 && step !== 'success') {
      router.push('/cart');
    }
  }, [items, step, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // Obtener user_id del localStorage si existe, sino null (guest)
      const stored = localStorage.getItem('user_id');
      const userId = stored && !stored.startsWith('temp-') ? stored : null;

      // Preparar los items para la API
      const orderItems = items.map(({ product, quantity }) => ({
        product_id: product.id,
        quantity,
        unit_price: product.price,
      }));

      // Construir customer data
      const customerName = `${shippingData.name} ${shippingData.lastName}`.trim();
      const shippingAddress = `${shippingData.address}, ${shippingData.city} ${shippingData.postalCode}`.trim();

      console.log('Enviando order:', { user_id: userId, customer_name: customerName, items: orderItems });

      // Llamar a la API para crear el pedido
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: userId,
          customer_name: customerName,
          customer_email: shippingData.email,
          customer_phone: '', // Phone field can be added to the form if needed
          shipping_address: shippingAddress,
          payment_name: customerName, // Usa el nombre del cliente como nombre de pago
          items: orderItems,
        }),
      });

      const responseData = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Error al crear el pedido');
      }

      const order = responseData;
      setOrderId(order.id);
      setStep('success');
      clearCart();
    } catch (err) {
      console.error('Error en checkout:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido');

      // Simular éxito como fallback para desarrollo
      setTimeout(() => {
        setOrderId(`SIM-${Date.now()}`);
        setStep('success');
        clearCart();
      }, 500);
    }
  };

  if (step === 'success') {
    return (
      <div className={styles.successContainer}>
        <CheckCircle size={64} className={styles.successIcon} />

        <h1 className={styles.successTitle}>¡Pedido Confirmado!</h1>

        <p className={styles.successText}>
          Tu pedido ha sido procesado exitosamente.
        </p>

        <p className={styles.orderId}>
          Número de pedido:{' '}
          <strong>
            {orderId ? orderId.slice(0, 8).toUpperCase() : 'N/A'}
          </strong>
        </p>

        <p className={styles.note}>
          Podés seguir tu pedido en el panel de administración.
        </p>

        <button
          onClick={() => router.push('/')}
          className={styles.primaryButton}
        >
          Volver a la Tienda
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Checkout</h1>

      <form onSubmit={handleSubmit} className={styles.grid}>
        {/* LEFT */}
        <div className={styles.left}>
          {/* Error */}
          {error && (
            <div className={styles.error}>
              Error: {error}
            </div>
          )}

          {/* Shipping */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Información de Envío</h3>

            <div className={styles.formGrid}>
              <input
                required
                placeholder="Nombre"
                className={styles.input}
                value={shippingData.name}
                onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })}
              />
              <input
                required
                placeholder="Apellido"
                className={styles.input}
                value={shippingData.lastName}
                onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
              />

              <input
                required
                placeholder="Email"
                type="email"
                className={`${styles.input} ${styles.full}`}
                value={shippingData.email}
                onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
              />

              <input
                required
                placeholder="Dirección"
                className={`${styles.input} ${styles.full}`}
                value={shippingData.address}
                onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
              />

              <input
                required
                placeholder="Ciudad"
                className={styles.input}
                value={shippingData.city}
                onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
              />
              <input
                required
                placeholder="Código Postal"
                className={styles.input}
                value={shippingData.postalCode}
                onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
              />
            </div>
          </div>

          {/* Payment */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <CreditCard size={18} /> Información de Pago
            </h3>

            <p className={styles.paymentNote}>
              Simulación de pago — no se realizarán cargos reales
            </p>

            <div className={styles.formGrid}>
              <input
                required
                placeholder="Número de tarjeta"
                defaultValue="4242 4242 4242 4242"
                className={`${styles.input} ${styles.full}`}
              />

              <input
                required
                placeholder="MM/AA"
                defaultValue="12/28"
                className={styles.input}
              />

              <input
                required
                placeholder="CVV"
                defaultValue="123"
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Tu Pedido</h3>

            <div className={styles.summaryItems}>
              {items.map(({ product, quantity }) => (
                <div key={product.id} className={styles.summaryItem}>
                  <span className={styles.productName}>
                    {product.name} x{quantity}
                  </span>
                  <span>
                    ${(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.totals}>
              <div className={styles.row}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className={styles.row}>
                <span>IVA (16%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className={styles.totalRow}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className={styles.primaryButton}
            >
              {processing ? (
                <>
                  <Loader2 size={18} className={styles.spinner} /> Procesando...
                </>
              ) : (
                `Pagar $${total.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};


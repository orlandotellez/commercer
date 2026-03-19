'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/features/cart/context/CartContext';
import { products, getProductBySlug } from '@/features/product/data/products';
import styles from './page.module.css';
import { ProductDetail } from '@/features/product/components/ProductDetail';
import { BreadCrumb } from '@/features/product/components/BreadCrumb';
import { ProductRelated } from '@/features/product/components/ProductRelated';
import { ProductNotFound } from '@/features/product/components/ProductNotFound';

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const product = getProductBySlug(slug);
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) {
    return <ProductNotFound />
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const stockStatus =
    product.stock > 10 ? 'in' : product.stock > 0 ? 'low' : 'out';

  const discount: number = product.originalPrice
    ? Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    )
    : 0;

  return (
    <div className={styles.container}>
      <BreadCrumb product={product} />

      <ProductDetail
        product={product}
        discount={discount}
        stockStatus={stockStatus}
        qty={qty}
        setQty={setQty}
        addItem={addItem}
      />

      <ProductRelated related={related} />
    </div>
  );
};

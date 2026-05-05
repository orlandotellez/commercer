'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/features/cart/context/CartContext';
import styles from './page.module.css';
import { ProductDetail } from '@/features/product/components/ProductDetail';
import { BreadCrumb } from '@/features/product/components/BreadCrumb';
import { ProductRelated } from '@/features/product/components/ProductRelated';
import { ProductNotFound } from '@/features/product/components/ProductNotFound';
import { Loader2 } from 'lucide-react';
import { ProductResponse } from '@/shared/types';
import { categorySlugToId } from '@/shared/lib/mappers';
import { listProducts } from '@/shared/api/products';

function mapToFrontendProduct(p: ProductResponse) {
  // Convertir original_price a número si existe
  let originalPrice: number | undefined = undefined;
  if (p.original_price !== undefined && p.original_price !== null) {
    if (typeof p.original_price === 'number') {
      originalPrice = p.original_price;
    } else if (typeof p.original_price === 'string') {
      originalPrice = parseFloat(p.original_price);
    } else if (p.original_price && typeof p.original_price === 'object') {
      // Puede venir como BigDecimal object { n: number, ... }
      const val = (p.original_price as any).n ?? (p.original_price as any).value ?? (p.original_price as any)._;
      if (typeof val === 'number') originalPrice = val;
      else if (typeof val === 'string') originalPrice = parseFloat(val);
    }
    // Si sigue siendo NaN, poner undefined
    if (isNaN(originalPrice as number)) originalPrice = undefined;
  }

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: categorySlugToId[p.category_id || ''] || 'unknown',
    brand: p.brand || '',
    price: p.price,
    originalPrice,
    image: p.image || '',
    images: p.image ? [p.image] : [],
    description: p.description || '',
    specs: p.specs || {},
    stock: p.stock,
    rating: 0,
    reviews: 0,
    featured: p.featured,
  };
}

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [allProducts, setAllProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const productsData = await listProducts({ limit: 100 });
        setAllProducts(productsData);

        // Buscar el producto por slug
        const found = productsData.find(p => p.slug === slug);
        setProduct(found || null);
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} />
      </div>
    );
  }

  if (!product) {
    return <ProductNotFound />
  }

  const frontendProduct = mapToFrontendProduct(product);

  const related = allProducts
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4)
    .map(mapToFrontendProduct);

  const stockStatus =
    product.stock > 10 ? 'in' : product.stock > 0 ? 'low' : 'out';

  const discount: number = product.original_price
    ? Math.round(
      ((product.original_price - product.price) / product.original_price) * 100
    )
    : 0;

  return (
    <div className={styles.container}>
      <BreadCrumb product={frontendProduct} />

      <ProductDetail
        product={frontendProduct}
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

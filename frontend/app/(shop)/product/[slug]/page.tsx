'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/context/CartContext';
import { listProducts, ProductResponse, categorySlugToId } from '@/shared/lib/api';
import styles from './page.module.css';
import { ProductDetail } from '@/features/product/components/ProductDetail';
import { BreadCrumb } from '@/features/product/components/BreadCrumb';
import { ProductRelated } from '@/features/product/components/ProductRelated';
import { ProductNotFound } from '@/features/product/components/ProductNotFound';
import { Loader2 } from 'lucide-react';

function mapToFrontendProduct(p: ProductResponse) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: categorySlugToId[p.category_id || ''] || 'unknown',
    brand: p.brand || '',
    price: p.price,
    originalPrice: p.original_price,
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
  const router = useRouter();
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

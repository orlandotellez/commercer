'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/features/product/components/ProductCard';
import { ArrowRight, Cpu, Shield, Truck, Headphones, Loader2 } from 'lucide-react';
import styles from './page.module.css';
import { CategoryResponse, ProductResponse } from '@/shared/types';
import { categorySlugToId } from '@/shared/lib/mappers';
import { listProducts } from '@/shared/api/products';
import { listCategories } from '@/shared/api/categories';

function mapToFrontendProduct(p: ProductResponse, categorySlug?: string) {
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
    category: categorySlugToId[categorySlug || ''] || 'unknown',
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

function mapToFrontendCategory(c: CategoryResponse, count: number) {
  const slugToId: Record<string, string> = {
    "procesadores": "cpu",
    "tarjetas-graficas": "gpu",
    "memoria": "ram",
    "almacenamiento": "storage",
    "placas-base": "motherboard",
    "fuentes-alimentacion": "psu",
    "monitores": "monitor",
    "perifericos": "peripherals",
    "accesorios": "accessories",
  };

  return {
    id: slugToId[c.slug] || c.slug,
    name: c.name,
    slug: c.slug,
    icon: 'Monitor',
    count,
  };
}

export default function HomePage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          listProducts({ limit: 100 }),
          listCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Mapear productos al formato del frontend
  const frontendProducts = useMemo(() => {
    return products.map(p => mapToFrontendProduct(p, p.category_id));
  }, [products]);

  // Contar productos por categoría
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      if (p.category_id) {
        counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Mapear categorías al formato del frontend
  const frontendCategories = useMemo(() => {
    return categories.map(c => mapToFrontendCategory(c, categoryCounts[c.slug] || 0));
  }, [categories, categoryCounts]);

  const featured = frontendProducts.filter(p => p.featured);
  const deals = frontendProducts.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 4);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} />
      </div>
    );
  }

  // Si no hay productos, mostrar estado vacío
  if (products.length === 0) {
    return (
      <div>
        {/* Hero */}
        <section className={styles.hero} >
          <div className={styles.container}>
            <div className={styles.heroContent}>
              <h1 className={styles.title}>
                Hardware de <span>Alto Rendimiento</span>
              </h1>

              <p className={styles.subtitle}>
                Los mejores componentes para tu PC. CPUs, GPUs, RAM y más de las marcas líderes al mejor precio.
              </p>

              <div className={styles.heroActions}>
                <Link href="/admin/products" className={styles.primaryBtn}>
                  Agregar Productos
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Message */}
        <section className={styles.section}>
          <div className={styles.emptyState}>
            <p>No hay productos disponibles</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className={styles.hero} >
        <div className={styles.container}>
          <div className={styles.heroContent}>

            <h1 className={styles.title}>
              Hardware de <span>Alto Rendimiento</span>
            </h1>

            <p className={styles.subtitle}>
              Los mejores componentes para tu PC. CPUs, GPUs, RAM y más de las marcas líderes al mejor precio.
            </p>

            <div className={styles.heroActions}>
              <Link href="/shop" className={styles.primaryBtn}>
                Ver Catálogo
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/shop?categoria=tarjetas-graficas"
                className={styles.secondaryBtn}
              >
                GPUs en Oferta
              </Link>
            </div>
          </div>
        </div>
      </section >

      {/* Features */}
      < section className={styles.features} >
        <div className={styles.containerGrid}>
          {[
            { icon: Truck, text: 'Envío Gratis' },
            { icon: Shield, text: 'Garantía Oficial' },
            { icon: Cpu, text: 'Hardware Original' },
            { icon: Headphones, text: 'Soporte 24/7' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className={styles.featureItem}>
              <Icon size={18} className={styles.featureIcon} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section >

      {/* Categories */}
      < section className={styles.section} >
        <h2 className={styles.sectionTitle}>Categorías</h2>

        <div className={styles.categoriesGrid}>
          {frontendCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?categoria=${cat.slug}`}
              className={styles.categoryCard}
            >
              <p>{cat.name}</p>
            </Link>
          ))}
        </div>
      </section >

      {/* Featured */}
      {featured.length > 0 && (
        < section className={styles.section} >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Productos Destacados</h2>

            <Link href="/shop" className={styles.link}>
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.productsGrid}>
            {featured.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section >
      )}

      {/* Deals */}
      {deals.length > 0 && (
        < section className={styles.section} >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🔥 Ofertas del Día</h2>

            <Link href="/shop" className={styles.link}>
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.dealsGrid}>
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section >
      )}
    </div>
  );
}

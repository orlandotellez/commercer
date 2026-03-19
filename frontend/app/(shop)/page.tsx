'use client';

import Link from 'next/link';
import { categories } from '@/features/product/data/categories';
import { getFeaturedProducts, products } from '@/features/product/data/products';
import { ProductCard } from '@/features/product/components/ProductCard';
import { ArrowRight, Cpu, Shield, Truck, Headphones } from 'lucide-react';
import styles from './page.module.css';

export default function HomePage() {
  const featured = getFeaturedProducts();
  const deals = products.filter((p) => p.originalPrice).slice(0, 4);

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
          {categories.map((cat) => (
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
      < section className={styles.section} >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Productos Destacados</h2>

          <Link href="/shop" className={styles.link}>
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        <div className={styles.productsGrid}>
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section >

      {/* Deals */}
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
    </div>
  );
}

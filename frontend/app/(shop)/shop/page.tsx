'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { products } from '@/features/product/data/products';
import { categories } from '@/features/product/data/categories';
import { ProductCard } from '@/features/product/components/ProductCard';
import styles from './page.module.css';
import { Sidebar } from '@/features/shop/components/Sidebar';
import { TopBar } from '@/features/shop/components/TopBar';
import { BreadCrumb } from '@/features/shop/components/BreadCrumb';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categorySlug = searchParams.get('categoria');

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  const updateCategory = (slug?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!slug) {
      params.delete('categoria');
    } else {
      params.set('categoria', slug);
    }

    router.push(`/shop?${params.toString()}`);
  };

  const filtered = useMemo(() => {
    let result = [...products];

    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory.id);
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort(
          (a, b) =>
            (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        );
    }

    return result;
  }, [activeCategory, priceRange, sortBy]);

  const brands = useMemo(() => {
    const filteredByCategory = activeCategory
      ? products.filter((p) => p.category === activeCategory.id)
      : products;

    return [...new Set(filteredByCategory.map((p) => p.brand))];
  }, [activeCategory]);

  return (
    <div className={styles.container}>
      <BreadCrumb activeCategory={activeCategory} />

      <div className={styles.layout}>
        <Sidebar
          categories={categories}
          products={products}
          categorySlug={categorySlug}
          priceRange={priceRange}
          brands={brands}
          updateCategory={updateCategory}
          setPriceRange={setPriceRange}
        />

        {/* Main */}
        <div className={styles.main}>
          <TopBar
            products={products}
            categories={categories}
            categorySlug={categorySlug}
            showFilters={showFilters}
            activeCategory={activeCategory}
            filtered={filtered}
            sortBy={sortBy}
            setSortBy={(e) => setSortBy(e.target.value)}
            setShowFilters={setShowFilters}
            updateCategory={updateCategory}
          />

          {/* Products */}
          <div className={styles.grid}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Empty */}
          {filtered.length === 0 && (
            <div className={styles.empty}>
              <p>No se encontraron productos</p>
              <span>Intenta con otros filtros</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

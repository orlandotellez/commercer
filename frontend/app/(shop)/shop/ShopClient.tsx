'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { listProducts, ProductResponse, listCategories, CategoryResponse, categorySlugToId } from '@/shared/lib/api';
import { ProductCard } from '@/features/product/components/ProductCard';
import styles from './ShopClient.module.css';
import { Sidebar } from '@/features/shop/components/Sidebar';
import { TopBar } from '@/features/shop/components/TopBar';
import { BreadCrumb } from '@/features/shop/components/BreadCrumb';
import { Loader2 } from 'lucide-react';

// Convertir del formato del backend al formato del frontend
function mapToFrontendProduct(p: ProductResponse, categoryIdToSlug: Record<string, string>) {
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
    // Si sigue siendo NaN,poner undefined
    if (isNaN(originalPrice as number)) originalPrice = undefined;
  }
    
  // Convertir category_id (UUID) a slug
  const categorySlug = p.category_id ? categoryIdToSlug[p.category_id] || '' : '';
    
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: categorySlug,
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

// Convertir categoría del backend al formato del frontend
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

export default function ShopClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categorySlug = searchParams.get('categoria');

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState('featured');

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

  // Mapa de category_id (UUID) → category slug
  const categoryIdToSlug = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(c => {
      map[c.id] = c.slug;
    });
    return map;
  }, [categories]);

  // Contar productos por categoría (usando el slug)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      if (p.category_id) {
        const slug = categoryIdToSlug[p.category_id];
        if (slug) {
          counts[slug] = (counts[slug] || 0) + 1;
        }
      }
    });
    return counts;
  }, [products, categoryIdToSlug]);

  // Mapear categorías al formato del frontend
  const frontendCategories = useMemo(() => {
    return categories.map(c => mapToFrontendCategory(c, categoryCounts[c.slug] || 0));
  }, [categories, categoryCounts]);

  // Mapear productos al formato del frontend
  const frontendProducts = useMemo(() => {
    return products.map(p => mapToFrontendProduct(p, categoryIdToSlug));
  }, [products, categoryIdToSlug]);

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
    let result = [...frontendProducts];

    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory.slug);
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
  }, [frontendProducts, activeCategory, priceRange, sortBy]);

  const brands = useMemo(() => {
    const filteredByCategory = activeCategory
      ? frontendProducts.filter((p) => p.category === activeCategory.slug)
      : frontendProducts;

    return [...new Set(filteredByCategory.map((p) => p.brand))];
  }, [frontendProducts, activeCategory]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BreadCrumb 
        activeCategory={activeCategory ? {
          id: activeCategory.slug,
          name: activeCategory.name,
          slug: activeCategory.slug,
          icon: 'Monitor',
          count: categoryCounts[activeCategory.slug] || 0,
        } : undefined} 
      />

      <div className={styles.layout}>
        <Sidebar
          categories={frontendCategories}
          products={frontendProducts}
          categorySlug={categorySlug}
          priceRange={priceRange}
          brands={brands}
          updateCategory={updateCategory}
          setPriceRange={setPriceRange}
        />

        {/* Main */}
        <div className={styles.main}>
          <TopBar
            products={frontendProducts}
            categories={frontendCategories}
            categorySlug={categorySlug}
            showFilters={false}
            activeCategory={activeCategory ? {
              id: activeCategory.slug,
              name: activeCategory.name,
              slug: activeCategory.slug,
              icon: 'Monitor',
              count: categoryCounts[activeCategory.slug] || 0,
            } : undefined}
            filtered={filtered}
            sortBy={sortBy}
            setSortBy={(e) => setSortBy(e.target.value)}
            setShowFilters={() => {}}
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
}

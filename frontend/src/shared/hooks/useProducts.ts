import { useEffect, useState } from "react";
import { CategoryResponse, createProduct, CreateProductPayload, deleteProduct, generateSlug, listProducts, updateProduct } from "../lib/api";
import { categoryMap, mapToAdminProduct } from "../lib/mappers";
import { AdminProduct } from "../types";

export function useProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [_seeding, setSeeding] = useState(false)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listProducts({ limit: 100 });
      setProducts(data.map(mapToAdminProduct));
    } catch {
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedProducts = async (categories: CategoryResponse[]) => {
    if (categories.length === 0) {
      alert("Primero debés crear las categorías");
      return;
    }
    if (!confirm("¿Agregar productos de prueba?")) return;

    try {
      setSeeding(true);
      let addedCount = 0;

      for (const p of products) {
        const slug = generateSlug(p.name);
        const catSlug = categoryMap[p.category] || "sin-categoria";
        const category = categories.find(c => c.slug === catSlug);

        const payload: CreateProductPayload = {
          name: p.name,
          slug,
          description: p.description,
          price: p.price,
          original_price: p.originalPrice,
          image: p.image,
          category_id: category?.id,
          brand: p.brand,
          stock: p.stock,
          specs: p.specs,
          active: true,
          featured: p.featured,
        };

        await createProduct(payload);
        addedCount++;
      }

      alert(`Se agregaron ${addedCount} productos`);
      await fetchProducts();
    } catch {
      alert("Error al agregar productos de prueba");
    } finally {
      setSeeding(false);
    }
  };


  const handleCreate = async (payload: CreateProductPayload) => {
    await createProduct(payload);
    await fetchProducts();
  };

  const handleUpdate = async (id: string, payload: Partial<CreateProductPayload>) => {
    await updateProduct(id, payload);
    await fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    await deleteProduct(id);
    await fetchProducts();
  };

  useEffect(() => { fetchProducts(); }, []);

  return { products, handleSeedProducts, loading, error, fetchProducts, handleCreate, handleUpdate, handleDelete };
}

import { useEffect, useState } from "react";
import { CategoryResponse } from "../types";
import { createCategory, listCategories } from "../api/categories";
import { seedCategories } from "../lib/data";

export function useCategories() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [seeding, setSeeding] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await listCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleSeedCategories = async () => {
    try {
      setSeeding(true);
      for (const cat of seedCategories) await createCategory(cat);
      await fetchCategories();
      alert("Categorías creadas");
    } catch {
      alert("Error al crear categorías");
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  return { categories, fetchCategories, seeding, handleSeedCategories };
}

import { AdminProduct, Order, OrderResponse, OrderStatus } from "../types";

export function mapToAdminProduct(p: any): AdminProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category_id || "sin-categoria",
    stock: p.stock,
    price: p.price,
    originalPrice: p.original_price,
    status: p.active ? "active" : "inactive",
    image: p.image,
    brand: p.brand,
    description: p.description,
    featured: p.featured,
  };
}

export const categoryMap: Record<string, string> = {
  "Procesadores": "cpu",
  "Tarjetas Gráficas": "gpu",
  "Memoria": "ram",
  "Almacenamiento": "storage",
  "Placas Madre": "motherboard",
  "Fuentes de Poder": "psu",
  "Monitores": "monitor",
  "Periféricos": "peripherals",
  "Accesorios PC": "accessories",
};

// Mapear respuesta de API a formato de UI
export function mapApiOrderToUi(apiOrder: OrderResponse): Order {
  return {
    id: apiOrder.id,
    customer: apiOrder.user_id, // Por ahora mostrar user_id como cliente
    email: "", // El backend no devuelve email del usuario todavía
    total: apiOrder.total,
    status: apiOrder.status as OrderStatus,
    date: apiOrder.created_at?.split("T")[0] || "",
    items: apiOrder.items.length,
    user_id: apiOrder.user_id,
  };
}


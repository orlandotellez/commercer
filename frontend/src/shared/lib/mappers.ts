import { AdminProduct, Order, OrderResponse, OrderStatus } from "../types";

export function mapToAdminProduct(p: any): AdminProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category_name || p.category_id || "sin-categoria",
    categoryName: p.category_name,
    categoryId: p.category_id,
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
    customer: apiOrder.user_id,
    email: "", // El backend no devuelve email del usuario todavía
    total: apiOrder.total,
    status: apiOrder.status as OrderStatus,
    date: apiOrder.created_at?.split("T")[0] || "",
    items: apiOrder.items?.length || 0, // Cantidad de items
    order_items: apiOrder.items?.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.product_name || 'Producto',
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
    })) || [],
    user_id: apiOrder.user_id,
  };
}


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
  "cpu": "procesadores",
  "gpu": "tarjetas-graficas",
  "ram": "memoria",
  "storage": "almacenamiento",
  "motherboard": "placas-madre",
  "psu": "fuentes-de-poder",
  "monitor": "monitores",
  "peripherals": "perifericos",
  "accessories": "accesorios",
};

// Mapear respuesta de API a formato de UI
export function mapApiOrderToUi(apiOrder: OrderResponse): Order {
  return {
    id: apiOrder.id,
    customer: apiOrder.customer_name || apiOrder.user_id || "Guest",
    email: apiOrder.customer_email || "",
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
    customer_name: apiOrder.customer_name,
    customer_email: apiOrder.customer_email,
    customer_phone: apiOrder.customer_phone,
    shipping_address: apiOrder.shipping_address,
    payment_name: apiOrder.payment_name,
    is_guest: apiOrder.is_guest,
    subtotal: apiOrder.subtotal,
    taxes: apiOrder.taxes,
    created_at: apiOrder.created_at,
  };
}

// Map para convertir category_id del backend (slug) al id del frontend
export const categoryIdToSlug: Record<string, string> = {
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

export const categorySlugToId: Record<string, string> = {
  "cpu": "procesadores",
  "gpu": "tarjetas-graficas",
  "ram": "memoria",
  "storage": "almacenamiento",
  "motherboard": "placas-base",
  "psu": "fuentes-alimentacion",
  "monitor": "monitores",
  "peripherals": "perifericos",
  "accessories": "accesorios",
};


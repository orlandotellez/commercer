import { ChangePasswordPayload, ListOrdersParams, OrderResponse, OrdersListResponse, UpdateOrderStatusPayload, UpdateProfilePayload, UserProfile } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Función helper para obtener headers con auth
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  description?: string;
  price: number;
  original_price?: number;
  image?: string;
  category_id?: string;
  brand?: string;
  stock: number;
  specs?: Record<string, string>;
  active?: boolean;
  featured?: boolean;
}

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  original_price?: number;
  image?: string;
  category_id?: string;
  brand?: string;
  stock: number;
  specs?: Record<string, string>;
  active: boolean;
  featured: boolean;
  created_at?: string;
}

export interface ListProductsParams {
  search?: string;
  category_id?: string;
  featured?: boolean;
  active?: boolean;
  page?: number;
  limit?: number;
}

// Categories
export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
}

export async function listCategories(): Promise<CategoryResponse[]> {
  const res = await fetch(`${API_URL}/categories`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }

  return res.json();
}

export async function createCategory(payload: CreateCategoryPayload): Promise<CategoryResponse> {
  const res = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to create category' }));
    throw new Error(error.message || 'Failed to create category');
  }

  return res.json();
}

export async function deleteCategory(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to delete category' }));
    throw new Error(error.message || 'Failed to delete category');
  }

  return res.json();
}

// Seed data
export const seedCategories = [
  { name: "Procesadores", slug: "procesadores", description: "CPUs de Intel y AMD" },
  { name: "Tarjetas Gráficas", slug: "tarjetas-graficas", description: "GPUs de NVIDIA y AMD" },
  { name: "Memoria RAM", slug: "memoria", description: "Módulos de memoria DDR4 y DDR5" },
  { name: "Almacenamiento", slug: "almacenamiento", description: " SSDs y HDDs" },
  { name: "Placas Madre", slug: "placas-base", description: "Motherboards para Intel y AMD" },
  { name: "Fuentes de Poder", slug: "fuentes-alimentacion", description: "Fuentes modulares y semi-modulares" },
  { name: "Monitores", slug: "monitores", description: "Monitores gaming y profesionales" },
  { name: "Periféricos", slug: "perifericos", description: "Mouse, teclados, audífonos" },
  { name: "Accesorios PC", slug: "accesorios", description: "Coolers, gabinetes y más" },
];

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

export async function listProducts(params: ListProductsParams = {}): Promise<ProductResponse[]> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.category_id) searchParams.set('category_id', params.category_id);
  if (params.featured !== undefined) searchParams.set('featured', String(params.featured));
  if (params.active !== undefined) searchParams.set('active', String(params.active));
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  const url = `${API_URL}/products${query ? `?${query}` : ''}`;

  const res = await fetch(url, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return res.json();
}

export async function createProduct(payload: CreateProductPayload): Promise<ProductResponse> {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to create product' }));
    throw new Error(error.message || 'Failed to create product');
  }

  return res.json();
}

export async function updateProduct(id: string, payload: Partial<CreateProductPayload>): Promise<ProductResponse> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to update product');
  }

  return res.json();
}

export async function deleteProduct(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to delete product');
  }

  return res.json();
}

// Helper para generar slug
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}


export async function listOrders(params: ListOrdersParams = {}): Promise<OrdersListResponse> {
  const searchParams = new URLSearchParams();

  if (params.status) searchParams.set('status', params.status);
  if (params.user_id) searchParams.set('user_id', params.user_id);
  if (params.date_from) searchParams.set('date_from', params.date_from);
  if (params.date_to) searchParams.set('date_to', params.date_to);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  const url = `${API_URL}/orders${query ? `?${query}` : ''}`;

  const res = await fetch(url, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch orders');
  }

  return res.json();
}

export async function getOrder(id: string): Promise<OrderResponse> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch order');
  }

  return res.json();
}

export async function updateOrderStatus(id: string, payload: UpdateOrderStatusPayload): Promise<OrderResponse> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to update order status' }));
    throw new Error(error.message || 'Failed to update order status');
  }

  return res.json();
}

export async function deleteOrder(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to delete order');
  }

  return res.json();
}

// Obtener el user_id actual del localStorage
function getCurrentUserId(): string | null {
  // Primero buscar en user_id directo
  const userId = localStorage.getItem('user_id');
  if (userId) return userId;

  // Buscar en el objeto user guardado
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user?.id || null;
    } catch {
      return null;
    }
  }

  return null;
}

export async function getCurrentUser(): Promise<UserProfile> {
  const userId = getCurrentUserId();

  if (!userId) {
    // Si no hay user_id guardado, intentar obtenerlo del token
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No hay usuario logueado');
    }
    // Por ahora throw error, después podemos decodificar el JWT
    throw new Error('No se pudo obtener el usuario');
  }

  const res = await fetch(`${API_URL}/users/${userId}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user');
  }

  return res.json();
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  const userId = getCurrentUserId();

  if (!userId) {
    throw new Error('No hay usuario logueado');
  }

  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to update profile' }));
    throw new Error(error.message || 'Failed to update profile');
  }

  return res.json();
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean }> {
  const userId = getCurrentUserId();

  if (!userId) {
    throw new Error('No hay usuario logueado');
  }

  const res = await fetch(`${API_URL}/users/${userId}/password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to change password' }));
    throw new Error(error.message || 'Failed to change password');
  }

  return res.json();
}

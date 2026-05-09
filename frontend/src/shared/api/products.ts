import { API_URL } from "../lib/constants";
import { CreateProductPayload, ListProductsParams, ProductResponse } from "../types";
import { getAuthHeaders } from "../utils/auth";

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
    cache: 'no-store', // Evitar caché en cliente
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


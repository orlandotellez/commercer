import { API_URL } from "../lib/constants";
import { CategoryResponse, CreateCategoryPayload } from "../types";
import { getAuthHeaders } from "../utils/auth";

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

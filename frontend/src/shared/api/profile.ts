import { API_URL } from "../lib/constants";
import { ChangePasswordPayload, UpdateProfilePayload, UserProfile } from "../types";
import { getAuthHeaders } from "../utils/auth";

// Obtener el user_id actual del localStorage
function getCurrentUserId(): string | null {
  const userId = localStorage.getItem('user_id');
  if (userId) return userId;

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

import { API_URL } from "../lib/constants";
import { UserProfile } from "../types";
import { getAuthHeaders } from "../utils/auth";

export async function getCurrentUser(): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to fetch current user' }));
    throw new Error(error.message || 'Failed to fetch current user');
  }

  return res.json();
}
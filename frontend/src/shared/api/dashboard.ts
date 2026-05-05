import { API_URL } from "../lib/constants";
import { DashboardResponse } from "../types";
import { getAuthHeaders } from "../utils/auth";

export type TimeFilter = "day" | "week" | "month";

export async function getDashboard(period: TimeFilter = "month"): Promise<DashboardResponse> {
  const res = await fetch(`${API_URL}/dashboard?period=${period}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al cargar el dashboard' }));
    throw new Error(error.message || 'Error al cargar el dashboard');
  }

  return res.json();
}

export async function getDashboardChart(period: TimeFilter = "month"): Promise<any[]> {
  const res = await fetch(`${API_URL}/dashboard/chart?period=${period}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al cargar la gráfica' }));
    throw new Error(error.message || 'Error al cargar la gráfica');
  }

  return res.json();
}

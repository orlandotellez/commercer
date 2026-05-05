import { API_URL } from "../lib/constants";
import { ListOrdersParams, OrderResponse, OrdersListResponse, UpdateOrderStatusPayload } from "../types";
import { getAuthHeaders } from "../utils/auth";

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


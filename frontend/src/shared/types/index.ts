export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  description: string;
  specs: Record<string, string>;
  stock: number;
  rating: number;
  reviews: number;
  featured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  customer: string;
  email: string;
  items: OrderItem[];
  total: number;
  status: 'pendiente' | 'pagado' | 'enviado' | 'entregado';
  paymentMethod: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  products: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}


export interface OrderItemResponse {
  id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderResponse {
  id: string;
  user_id: string;
  status: string;
  subtotal: number;
  taxes: number;
  total: number;
  created_at?: string;
  items: OrderItemResponse[];
}

export interface OrdersListResponse {
  orders: OrderResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ListOrdersParams {
  search?: string;
  status?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface UpdateOrderStatusPayload {
  status: string;
}


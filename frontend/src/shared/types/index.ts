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


export type OrderStatus = "pending" | "processing" | "shipped" | "completed" | "cancelled";

export interface OrderItem {
  id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: OrderStatus;
  date: string;
  items: number;
  user_id: string;
  subtotal?: number;
  taxes?: number;
  created_at?: string;
  order_items?: OrderItem[];
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
  name: string;
  email: string;
  role: 'admin' | 'customer' | 'staff';
  email_verified: boolean;
  phone?: string;
  created_at: string;
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  email_verified: boolean;
  image?: string;
  created_at?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export type ProductStatus = "active" | "inactive";

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryId?: string;
  stock: number;
  price: number;
  originalPrice?: number;
  status: ProductStatus;
  image?: string;
  brand?: string;
  specs?: Record<string, string>;
  description?: string;
  featured: boolean;
}

// Dashboard types matching backend response (snake_case)
export interface DashboardKPI {
  title: string;
  value: string;
  change: string;
  trend: string;
}

export interface SalesDataPoint {
  label: string;
  value: number;
}

export interface DashboardOrder {
  id: string;
  products: string[];
  has_more: boolean;
  total: string;
  status: string;
  date: string;
}

export interface InventoryAlert {
  product: string;
  stock: number;
  threshold: number;
  urgent: boolean;
}

export interface TopProduct {
  name: string;
  sales: number;
  revenue: string;
}

// Backend response format (snake_case)
export interface DashboardResponse {
  kpis: DashboardKPI[];
  sales_chart: SalesDataPoint[];
  recent_orders: DashboardOrder[];
  inventory_alerts: InventoryAlert[];
  top_products: TopProduct[];
}

// Frontend-friendly format (camelCase with icons)
export interface DashboardKPIWithIcon extends DashboardKPI {
  icon: React.ComponentType<any>;
  color: string;
}

export interface DashboardData {
  kpis: DashboardKPIWithIcon[];
  salesData: SalesDataPoint[];
  recentOrders: DashboardOrder[];
  inventoryAlerts: InventoryAlert[];
  topProducts: TopProduct[];
}




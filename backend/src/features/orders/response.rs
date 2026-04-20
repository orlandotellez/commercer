use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct OrderResponse {
    pub id: String,
    pub user_id: String,
    pub status: String,
    pub subtotal: f64,
    pub taxes: f64,
    pub total: f64,
    pub created_at: Option<String>,
    pub items: Vec<OrderItemResponse>,
}

#[derive(Debug, Serialize)]
pub struct OrderItemResponse {
    pub id: String,
    pub product_id: String,
    pub product_name: Option<String>,
    pub quantity: i32,
    pub unit_price: f64,
    pub subtotal: f64,
}

#[derive(Debug, Serialize)]
pub struct DeleteResponse {
    pub success: bool,
}

#[derive(Debug, Serialize)]
pub struct OrdersListResponse {
    pub orders: Vec<OrderResponse>,
    pub total: i64,
    pub page: usize,
    pub limit: usize,
}
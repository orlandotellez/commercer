use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct CreateOrderRequest {
    pub user_id: Option<String>,
    pub customer_name: Option<String>,
    pub customer_email: Option<String>,
    pub customer_phone: Option<String>,
    pub shipping_address: Option<String>,
    pub payment_name: Option<String>,
    pub items: Vec<CreateOrderItemRequest>,
}

#[derive(Debug, Deserialize)]
pub struct CreateOrderItemRequest {
    pub product_id: String,
    pub quantity: i32,
    pub unit_price: f64,
}

#[derive(Debug, Deserialize)]
pub struct UpdateOrderStatusRequest {
    pub status: String,
}

#[derive(Debug, Deserialize)]
pub struct ListOrdersParams {
    pub search: Option<String>,
    pub status: Option<String>,
    pub user_id: Option<String>,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
    pub page: Option<usize>,
    pub limit: Option<usize>,
}
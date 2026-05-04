use bigdecimal::BigDecimal;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ProductResponse {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub price: f32,
    pub original_price: Option<BigDecimal>,
    pub image: Option<String>,
    pub category_id: Option<String>,
    pub category_name: Option<String>,
    pub brand: Option<String>,
    pub stock: i32,
    pub specs: Option<serde_json::Value>,
    pub active: bool,
    pub featured: bool,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct DeleteResponse {
    pub success: bool,
}

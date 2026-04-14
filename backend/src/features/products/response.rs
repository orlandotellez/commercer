use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ProductResponse {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub price: f32,
    pub original_price: Option<f32>,
    pub image: Option<String>,
    pub category_id: Option<String>,
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

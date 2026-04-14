use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct CreateProductRequest {
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
    pub active: Option<bool>,
    pub featured: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProductRequest {
    pub name: Option<String>,
    pub slug: Option<String>,
    pub description: Option<String>,
    pub price: Option<f32>,
    pub original_price: Option<f32>,
    pub image: Option<String>,
    pub category_id: Option<String>,
    pub brand: Option<String>,
    pub stock: Option<i32>,
    pub specs: Option<serde_json::Value>,
    pub active: Option<bool>,
    pub featured: Option<bool>,
}

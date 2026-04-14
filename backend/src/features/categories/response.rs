use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct CategoryResponse {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct DeleteCategoryResponse {
    pub success: bool,
}

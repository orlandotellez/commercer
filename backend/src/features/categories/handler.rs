use axum::{
    extract::{Path, State},
    response::Json,
};

use crate::{
    features::categories::service::CategoriesService,
    shared::{errors::AppError, state::AppState},
};

pub async fn list_categories(
    State(state): State<AppState>,
) -> Result<Json<Vec<crate::features::categories::response::CategoryResponse>>, AppError> {
    let categories = CategoriesService::list_categories(&state).await?;
    Ok(Json(categories))
}

pub async fn get_category(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<crate::features::categories::response::CategoryResponse>, AppError> {
    let category = CategoriesService::get_category(&state, id).await?;
    Ok(Json(category))
}

pub async fn create_category(
    State(state): State<AppState>,
    Json(payload): Json<crate::features::categories::request::CreateCategoryRequest>,
) -> Result<Json<crate::features::categories::response::CategoryResponse>, AppError> {
    let category = CategoriesService::create_category(&state, payload).await?;
    Ok(Json(category))
}

pub async fn update_category(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
    Json(payload): Json<crate::features::categories::request::UpdateCategoryRequest>,
) -> Result<Json<crate::features::categories::response::CategoryResponse>, AppError> {
    let category = CategoriesService::update_category(&state, id, payload).await?;
    Ok(Json(category))
}

pub async fn delete_category(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<crate::features::categories::response::DeleteCategoryResponse>, AppError> {
    CategoriesService::delete_category(&state, id).await?;
    Ok(Json(crate::features::categories::response::DeleteCategoryResponse { success: true }))
}

use axum::{
    extract::{Path, State},
    response::Json,
};

use crate::{
    features::categories::service::CategoriesService,
    shared::{errors::AppError, state::DbState},
};

pub async fn list_categories(
    State(db): State<DbState>,
) -> Result<Json<Vec<crate::features::categories::response::CategoryResponse>>, AppError> {
    let categories = CategoriesService::list_categories(&db).await?;
    Ok(Json(categories))
}

pub async fn get_category(
    State(db): State<DbState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<crate::features::categories::response::CategoryResponse>, AppError> {
    let category = CategoriesService::get_category(&db, id).await?;
    Ok(Json(category))
}

pub async fn create_category(
    State(db): State<DbState>,
    Json(payload): Json<crate::features::categories::request::CreateCategoryRequest>,
) -> Result<Json<crate::features::categories::response::CategoryResponse>, AppError> {
    let category = CategoriesService::create_category(&db, payload).await?;
    Ok(Json(category))
}

pub async fn update_category(
    State(db): State<DbState>,
    Path(id): Path<uuid::Uuid>,
    Json(payload): Json<crate::features::categories::request::UpdateCategoryRequest>,
) -> Result<Json<crate::features::categories::response::CategoryResponse>, AppError> {
    let category = CategoriesService::update_category(&db, id, payload).await?;
    Ok(Json(category))
}

pub async fn delete_category(
    State(db): State<DbState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<crate::features::categories::response::DeleteCategoryResponse>, AppError> {
    CategoriesService::delete_category(&db, id).await?;
    Ok(Json(crate::features::categories::response::DeleteCategoryResponse { success: true }))
}

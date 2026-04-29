use axum::{
    extract::{Path, Query, State},
    response::Json,
};

use crate::{
    features::products::service::{ListProductsParams, ProductsService},
    shared::{errors::AppError, state::AppState},
};

pub async fn list_products(
    State(state): State<AppState>,
    Query(params): Query<ListProductsParams>,
) -> Result<Json<Vec<crate::features::products::response::ProductResponse>>, AppError> {
    let products = ProductsService::list_products(&state, params).await?;
    Ok(Json(products))
}

pub async fn get_product(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<crate::features::products::response::ProductResponse>, AppError> {
    let product = ProductsService::get_product(&state, id).await?;
    Ok(Json(product))
}

pub async fn create_product(
    State(state): State<AppState>,
    Json(payload): Json<crate::features::products::request::CreateProductRequest>,
) -> Result<Json<crate::features::products::response::ProductResponse>, AppError> {
    let product = ProductsService::create_product(&state, payload).await?;
    Ok(Json(product))
}

pub async fn update_product(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
    Json(payload): Json<crate::features::products::request::UpdateProductRequest>,
) -> Result<Json<crate::features::products::response::ProductResponse>, AppError> {
    let product = ProductsService::update_product(&state, id, payload).await?;
    Ok(Json(product))
}

pub async fn delete_product(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<crate::features::products::response::DeleteResponse>, AppError> {
    ProductsService::delete_product(&state, id).await?;
    Ok(Json(crate::features::products::response::DeleteResponse {
        success: true,
    }))
}

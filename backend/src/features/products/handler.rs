use axum::{
    extract::{Path, Query, State},
    response::Json,
};

use crate::{
    features::products::service::{ListProductsParams, ProductsService},
    shared::{errors::AppError, state::DbState},
};

pub async fn list_products(
    State(db): State<DbState>,
    Query(params): Query<ListProductsParams>,
) -> Result<Json<Vec<crate::features::products::response::ProductResponse>>, AppError> {
    let products = ProductsService::list_products(&db, params).await?;
    Ok(Json(products))
}

pub async fn get_product(
    State(db): State<DbState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<crate::features::products::response::ProductResponse>, AppError> {
    let product = ProductsService::get_product(&db, id).await?;
    Ok(Json(product))
}

pub async fn create_product(
    State(db): State<DbState>,
    Json(payload): Json<crate::features::products::request::CreateProductRequest>,
) -> Result<Json<crate::features::products::response::ProductResponse>, AppError> {
    let product = ProductsService::create_product(&db, payload).await?;
    Ok(Json(product))
}

pub async fn update_product(
    State(db): State<DbState>,
    Path(id): Path<uuid::Uuid>,
    Json(payload): Json<crate::features::products::request::UpdateProductRequest>,
) -> Result<Json<crate::features::products::response::ProductResponse>, AppError> {
    let product = ProductsService::update_product(&db, id, payload).await?;
    Ok(Json(product))
}

pub async fn delete_product(
    State(db): State<DbState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<crate::features::products::response::DeleteResponse>, AppError> {
    ProductsService::delete_product(&db, id).await?;
    Ok(Json(crate::features::products::response::DeleteResponse {
        success: true,
    }))
}

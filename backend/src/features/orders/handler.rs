use axum::{
    extract::{Path, Query, State},
    response::Json,
};

use crate::{
    features::orders::{request::ListOrdersParams, service::OrdersService},
    shared::{errors::AppError, state::DbState},
};

pub async fn list_orders(
    State(db): State<DbState>,
    Query(params): Query<ListOrdersParams>,
) -> Result<Json<crate::features::orders::response::OrdersListResponse>, AppError> {
    let orders = OrdersService::list_orders(&db, params).await?;
    Ok(Json(orders))
}

pub async fn get_order(
    State(db): State<DbState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<crate::features::orders::response::OrderResponse>, AppError> {
    let order = OrdersService::get_order(&db, id).await?;
    Ok(Json(order))
}

pub async fn create_order(
    State(db): State<DbState>,
    Json(payload): Json<crate::features::orders::request::CreateOrderRequest>,
) -> Result<Json<crate::features::orders::response::OrderResponse>, AppError> {
    let order = OrdersService::create_order(&db, payload).await?;
    Ok(Json(order))
}

pub async fn update_order_status(
    State(db): State<DbState>,
    Path(id): Path<uuid::Uuid>,
    Json(payload): Json<crate::features::orders::request::UpdateOrderStatusRequest>,
) -> Result<Json<crate::features::orders::response::OrderResponse>, AppError> {
    let order = OrdersService::update_order_status(&db, id, payload).await?;
    Ok(Json(order))
}

pub async fn delete_order(
    State(db): State<DbState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<crate::features::orders::response::DeleteResponse>, AppError> {
    OrdersService::delete_order(&db, id).await?;
    Ok(Json(crate::features::orders::response::DeleteResponse { success: true }))
}
use axum::{
    extract::{Path, Query, State},
    response::Json,
};

use crate::{
    features::{
        email::service::EmailService,
        orders::{
            request::{CreateOrderRequest, ListOrdersParams, UpdateOrderStatusRequest},
            response::{DeleteResponse, OrderResponse, OrdersListResponse},
            service::OrdersService,
        },
    },
    shared::{errors::AppError, state::AppState},
};

pub async fn list_orders(
    State(state): State<AppState>,
    Query(params): Query<ListOrdersParams>,
) -> Result<Json<OrdersListResponse>, AppError> {
    let orders: OrdersListResponse = OrdersService::list_orders(&state, params).await?;
    Ok(Json(orders))
}

pub async fn get_order(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<OrderResponse>, AppError> {
    let order: OrderResponse = OrdersService::get_order(&state, id).await?;
    Ok(Json(order))
}

pub async fn create_order(
    State(state): State<AppState>,
    Json(payload): Json<CreateOrderRequest>,
) -> Result<Json<OrderResponse>, AppError> {
    let order: OrderResponse = OrdersService::create_order(&state, payload).await?;

    // Send invoice email asynchronously (fire and forget, ignore errors)
    let order_clone: OrderResponse = order.clone();
    tokio::spawn(async move {
        if let Err(e) = EmailService::send_invoice(&order_clone).await {
            tracing::warn!("Failed to send invoice email: {}", e);
        }
    });

    Ok(Json(order))
}

pub async fn update_order_status(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
    Json(payload): Json<UpdateOrderStatusRequest>,
) -> Result<Json<OrderResponse>, AppError> {
    let order: OrderResponse = OrdersService::update_order_status(&state, id, payload).await?;
    Ok(Json(order))
}

pub async fn delete_order(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<DeleteResponse>, AppError> {
    OrdersService::delete_order(&state, id).await?;
    Ok(Json(DeleteResponse { success: true }))
}

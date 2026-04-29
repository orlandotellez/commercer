use axum::Router;

use crate::{features::orders::handler, shared::state::AppState};

pub fn orders_router() -> Router<AppState> {
    Router::new()
        .route("/", axum::routing::get(handler::list_orders))
        .route("/", axum::routing::post(handler::create_order))
        .route("/{id}", axum::routing::get(handler::get_order))
        .route("/{id}", axum::routing::put(handler::update_order_status))
        .route("/{id}", axum::routing::delete(handler::delete_order))
}

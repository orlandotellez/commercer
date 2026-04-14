use axum::Router;

use crate::{features::products::handler, shared::state::DbState};

pub fn routes() -> Router<DbState> {
    Router::new()
        .route("/", axum::routing::get(handler::list_products))
        .route("/", axum::routing::post(handler::create_product))
        .route("/{id}", axum::routing::get(handler::get_product))
        .route("/{id}", axum::routing::put(handler::update_product))
        .route("/{id}", axum::routing::delete(handler::delete_product))
}

use axum::Router;
use axum::routing::{delete, get, post, put};

use super::handler::*;
use crate::shared::state::DbState;

pub fn categories_router() -> Router<DbState> {
    Router::new()
        .route("/", get(list_categories))
        .route("/", post(create_category))
        .route("/{id}", get(get_category))
        .route("/{id}", put(update_category))
        .route("/{id}", delete(delete_category))
}

use axum::routing::{delete, get, post, put};
use axum::Router;

use super::handler::*;
use crate::shared::state::AppState;

pub fn categories_router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_categories))
        .route("/", post(create_category))
        .route("/{id}", get(get_category))
        .route("/{id}", put(update_category))
        .route("/{id}", delete(delete_category))
}

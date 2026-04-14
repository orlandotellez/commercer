use axum::Router;

use crate::{features::users::handler, shared::state::DbState};

pub fn routes() -> Router<DbState> {
    Router::new()
        .route("/users", axum::routing::get(handler::list_users))
        .route("/users", axum::routing::post(handler::create_user))
        .route("/users/{id}", axum::routing::get(handler::get_user))
        .route("/users/{id}", axum::routing::put(handler::update_user))
        .route("/users/{id}", axum::routing::delete(handler::delete_user))
}

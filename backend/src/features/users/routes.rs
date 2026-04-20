use axum::Router;

use crate::{features::users::handler, shared::state::DbState};

pub fn routes() -> Router<DbState> {
    Router::new()
        .route("/", axum::routing::get(handler::list_users))
        .route("/", axum::routing::post(handler::create_user))
        .route("/{id}", axum::routing::get(handler::get_user))
        .route("/{id}", axum::routing::put(handler::update_user))
        .route("/{id}", axum::routing::delete(handler::delete_user))
        .route("/{id}/password", axum::routing::put(handler::change_password))
}

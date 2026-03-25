use axum::{
    Router,
    routing::{get, post},
};

use crate::{features::auth::register::handler, shared::state::DbState};

pub fn routes() -> Router<DbState> {
    Router::new()
        .route("/login", get(|| async { "login" }))
        .route("/register", post(handler::register_user))
}

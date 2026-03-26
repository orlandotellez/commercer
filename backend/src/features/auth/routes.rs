use axum::{Router, routing::post};

use crate::{
    features::auth::{
        login::handler::login_user, refresh::handler::refresh, register::handler::register_user,
    },
    shared::state::DbState,
};

pub fn routes() -> Router<DbState> {
    Router::new()
        .route("/login", post(login_user))
        .route("/register", post(register_user))
        .route("/refresh", post(refresh))
}

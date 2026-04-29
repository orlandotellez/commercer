use axum::{routing::post, Router};

use crate::{
    features::auth::{
        login::handler::login_user, refresh::handler::refresh, register::handler::register_user,
    },
    shared::state::AppState,
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/login", post(login_user))
        .route("/register", post(register_user))
        .route("/refresh", post(refresh))
}

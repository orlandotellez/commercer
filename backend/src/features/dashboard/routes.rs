use axum::Router;

use crate::{features::dashboard::handler, shared::state::AppState};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", axum::routing::get(handler::get_dashboard))
}

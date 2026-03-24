use axum::{Router, routing::get};

pub fn v1_routes() -> Router {
    Router::new().route("/", get(|| async { "hello world" }))
}

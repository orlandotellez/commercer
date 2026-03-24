use axum::Router;

mod v1;

pub fn create_routes() -> Router {
    Router::new().merge(v1::v1_routes())
}

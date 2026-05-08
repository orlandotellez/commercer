use axum::Router;

use crate::{features, shared::state::AppState};

pub fn create_routes() -> Router<AppState> {
    Router::new()
        .nest("/api/v1/auth", features::auth::routes::routes())
        .nest("/api/v1/users", features::users::routes::routes())
        .nest("/api/v1/products", features::products::routes::routes())
        .nest(
            "/api/v1/categories",
            features::categories::routes::categories_router(),
        )
        .nest("/api/v1/orders", features::orders::routes::orders_router())
        .nest("/api/v1/dashboard", features::dashboard::routes::routes())
}

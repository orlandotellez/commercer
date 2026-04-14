use axum::Router;

use crate::{features, shared::state::DbState};

pub fn create_routes() -> Router<DbState> {
    Router::new()
        .nest("/api/v1/auth", features::auth::routes::routes())
        .nest("/api/v1/users", features::users::routes::routes())
        .nest("/api/v1/products", features::products::routes::routes())
        .nest(
            "/api/v1/categories",
            features::categories::routes::categories_router(),
        )
}

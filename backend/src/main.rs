mod database;
mod features;
mod routes;
mod shared;

#[cfg(test)]
mod tests;

use axum::{Router, http};
use dotenvy::dotenv;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

use crate::{
    database::connection::create_pool,
    shared::{config::constants::FRONTEND_URL, state::AppState},
};

const PORT: i32 = 3001;
const HOST: &str = "0.0.0.0";

#[tokio::main]
async fn main() {
    dotenv().ok();

    let cors = CorsLayer::new()
        .allow_origin(FRONTEND_URL.parse::<http::HeaderValue>().unwrap())
        .allow_methods([
            http::Method::GET,
            http::Method::POST,
            http::Method::PUT,
            http::Method::PATCH,
            http::Method::DELETE,
        ])
        .allow_headers([http::header::CONTENT_TYPE, http::header::AUTHORIZATION])
        .allow_credentials(true);

    let db = create_pool().await.expect("Error connect database");

    let router: Router = routes::create_routes()
        .with_state(AppState { db: db })
        .layer(cors);

    let addr: String = format!("{}:{}", HOST, PORT);

    let listener: TcpListener = TcpListener::bind(&addr).await.unwrap();

    println!("servidor iniciado en http://{}/api/v1", &addr);

    axum::serve(listener, router).await.unwrap()
}

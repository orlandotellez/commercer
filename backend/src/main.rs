mod database;
mod features;
mod routes;
mod shared;

use axum::Router;
use dotenvy::dotenv;
use tokio::net::TcpListener;

use crate::database::connection::create_pool;

const PORT: i32 = 3001;
const HOST: &str = "0.0.0.0";

#[tokio::main]
async fn main() {
    dotenv().ok();

    let db = create_pool().await.expect("Error connect database");

    let router: Router = routes::create_routes().with_state(db);

    let addr: String = format!("{}:{}", HOST, PORT);

    let listener: TcpListener = TcpListener::bind(&addr).await.unwrap();

    println!("servidor iniciado en http://{}", &addr);

    axum::serve(listener, router).await.unwrap()
}

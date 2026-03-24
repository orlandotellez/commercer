mod routes;
use axum::Router;
use tokio::net::TcpListener;

const PORT: i32 = 3000;
const HOST: &str = "0.0.0.0";

#[tokio::main]
async fn main() {
    let router: Router = routes::create_routes();

    let addr: String = format!("{}:{}", HOST, PORT);

    let listener: TcpListener = TcpListener::bind(&addr).await.unwrap();

    println!("servidor iniciado en http://{}", &addr);

    axum::serve(listener, router).await.unwrap()
}

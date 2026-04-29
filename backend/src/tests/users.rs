use serde_json::json;
use tokio::net::TcpListener;
use reqwest;
use dotenvy::dotenv;

use crate::{database::connection::create_pool, routes::create_routes, shared::state::AppState};

#[tokio::test]
async fn test_create_user() {
    dotenv().ok();
    
    let db = create_pool().await.unwrap();
    
    let app = create_routes().with_state(AppState { db });

    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();
    
    let handle = tokio::spawn(async move {
        axum::serve(listener, app).await.unwrap();
    });
    
    tokio::time::sleep(std::time::Duration::from_millis(100)).await;

    let client = reqwest::Client::new();
    
    let payload = json!({
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
    });

    let response = client
        .post(format!("http://{}/api/v1/users", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();

    println!("Status: {}", response.status());
    
    handle.abort();
    
    assert!(response.status().is_success() || response.status().as_u16() == 201);
}
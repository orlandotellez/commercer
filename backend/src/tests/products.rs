use crate::shared::state::AppState;
use crate::routes::create_routes;
use crate::tests::helpers::{create_test_pool, cleanup_test_data, create_test_category, create_test_product};
use std::net::SocketAddr;
use uuid::Uuid;

/// Test helper to spawn the test server
async fn spawn_test_server(db: sqlx::PgPool) -> (tokio::task::JoinHandle<()>, reqwest::Client, SocketAddr) {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();

    let app = create_routes().with_state(AppState { db });

    let handle = tokio::spawn(async move {
        axum::serve(listener, app).await.unwrap();
    });

    tokio::time::sleep(std::time::Duration::from_millis(100)).await;

    let client = reqwest::Client::new();

    (handle, client, addr)
}

fn generate_unique_slug(prefix: &str) -> String {
    format!("{}_{}", prefix, Uuid::new_v4())
}

#[tokio::test]
async fn test_create_product_success() {
    let pool = create_test_pool().await.unwrap();
    let category_id = create_test_category(&pool, "Electronics", &generate_unique_slug("electronics")).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let payload = serde_json::json!({
        "name": "Laptop Pro",
        "slug": generate_unique_slug("laptop-pro"),
        "description": "High performance laptop",
        "price": 1299.99,
        "original_price": 1499.99,
        "image": "https://example.com/laptop.jpg",
        "category_id": category_id.to_string(),
        "brand": "TechBrand",
        "stock": 50,
        "specs": { "ram": "16GB", "storage": "512GB SSD" },
        "active": true,
        "featured": true
    });

    let response = client
        .post(format!("http://{}/api/v1/products", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success() || response.status().as_u16() == 201);

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert_eq!(body["name"], "Laptop Pro");

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_list_products_empty() {
    let pool = create_test_pool().await.unwrap();
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .get(format!("http://{}/api/v1/products", addr))
        .send()
        .await
        .unwrap();

    // Debug - show status
    let status = response.status();
    println!("Products list status: {}", status);

    assert!(response.status().is_success(), "Got status: {}", status);

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert!(body.as_array().unwrap().is_empty());

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_list_products_with_data() {
    let pool = create_test_pool().await.unwrap();
    let category_id = create_test_category(&pool, "Gaming", &generate_unique_slug("gaming")).await.unwrap();
    let _ = create_test_product(&pool, "Gaming Mouse", &generate_unique_slug("gaming-mouse"), 59.99, Some(category_id)).await.unwrap();
    let _ = create_test_product(&pool, "Gaming Keyboard", &generate_unique_slug("gaming-keyboard"), 129.99, Some(category_id)).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .get(format!("http://{}/api/v1/products", addr))
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    let body = response.json::<serde_json::Value>().await.unwrap();
    let products = body.as_array().unwrap();
    assert_eq!(products.len(), 2);

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_product_by_id() {
    let pool = create_test_pool().await.unwrap();
    let category_id = create_test_category(&pool, "Audio", &generate_unique_slug("audio")).await.unwrap();
    let product_id = create_test_product(&pool, "Wireless Headphones", &generate_unique_slug("wireless-headphones"), 199.99, Some(category_id)).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .get(format!("http://{}/api/v1/products/{}", addr, product_id))
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert_eq!(body["name"], "Wireless Headphones");

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_product_by_id_not_found() {
    let pool = create_test_pool().await.unwrap();
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let fake_id = "550e8400-e29b-41d4-a716-446655440000";

    let response = client
        .get(format!("http://{}/api/v1/products/{}", addr, fake_id))
        .send()
        .await
        .unwrap();

    assert_eq!(response.status().as_u16(), 404);

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_update_product() {
    let pool = create_test_pool().await.unwrap();
    let category_id = create_test_category(&pool, "Accessories", &generate_unique_slug("accessories")).await.unwrap();
    let product_id = create_test_product(&pool, "USB Cable", &generate_unique_slug("usb-cable"), 9.99, Some(category_id)).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let payload = serde_json::json!({
        "name": "USB-C Cable",
        "price": 14.99,
        "stock": 200,
        "featured": true
    });

    let response = client
        .put(format!("http://{}/api/v1/products/{}", addr, product_id))
        .json(&payload)
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert_eq!(body["name"], "USB-C Cable");

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_delete_product() {
    let pool = create_test_pool().await.unwrap();
    let category_id = create_test_category(&pool, "ToDelete", &generate_unique_slug("to-delete")).await.unwrap();
    let product_id = create_test_product(&pool, "Temp Product", &generate_unique_slug("temp-product"), 9.99, Some(category_id)).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .delete(format!("http://{}/api/v1/products/{}", addr, product_id))
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    let get_response = client
        .get(format!("http://{}/api/v1/products/{}", addr, product_id))
        .send()
        .await
        .unwrap();

    assert_eq!(get_response.status().as_u16(), 404);

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_list_products_with_filters() {
    let pool = create_test_pool().await.unwrap();
    let cat1 = create_test_category(&pool, "Cat1", &generate_unique_slug("cat-1")).await.unwrap();
    let _ = create_test_product(&pool, "Product A", &generate_unique_slug("product-a"), 50.0, Some(cat1)).await.unwrap();
    let _ = create_test_product(&pool, "Product B", &generate_unique_slug("product-b"), 100.0, Some(cat1)).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .get(format!("http://{}/api/v1/products?category_id={}", addr, cat1))
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());
    let body = response.json::<serde_json::Value>().await.unwrap();
    let products = body.as_array().unwrap();
    assert_eq!(products.len(), 2);

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}
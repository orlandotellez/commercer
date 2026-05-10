use crate::shared::helpers::password::hash_password;
use crate::shared::state::AppState;
use crate::routes::create_routes;
use crate::tests::helpers::{create_test_pool, cleanup_test_data, create_test_user, create_test_category, create_test_product};
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
async fn test_create_order_as_guest() {
    let pool = create_test_pool().await.unwrap();
    let category_id = create_test_category(&pool, "TestCat", &generate_unique_slug("test-cat")).await.unwrap();
    let product_id = create_test_product(&pool, "Test Product", &generate_unique_slug("test-product"), 50.0, Some(category_id)).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let payload = serde_json::json!({
        "customer_name": "Guest User",
        "customer_email": "guest@example.com",
        "customer_phone": "+5491112345678",
        "shipping_address": "Test Address 123",
        "payment_name": "Credit Card",
        "items": [
            {
                "product_id": product_id.to_string(),
                "quantity": 2,
                "unit_price": 50.0
            }
        ]
    });

    let response = client
        .post(format!("http://{}/api/v1/orders", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();

    println!("Create order status: {}", response.status());

    assert!(response.status().is_success() || response.status().as_u16() == 201, "Status: {}", response.status());

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert_eq!(body["customer_name"], "Guest User");

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_create_order_with_user() {
    let pool = create_test_pool().await.unwrap();

    let password_hash = hash_password("password123").unwrap();
    let user_id = create_test_user(&pool, "Test User", &format!("orderuser_{}@example.com", Uuid::new_v4()), "customer", &password_hash).await.unwrap();

    let category_id = create_test_category(&pool, "Category", &generate_unique_slug("category")).await.unwrap();
    let product_id = create_test_product(&pool, "Product", &generate_unique_slug("product"), 100.0, Some(category_id)).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let payload = serde_json::json!({
        "user_id": user_id.to_string(),
        "customer_name": "Test User",
        "customer_email": "orderuser@example.com",
        "customer_phone": "+5491112345678",
        "shipping_address": "User Address 456",
        "payment_name": "MercadoPago",
        "items": [
            {
                "product_id": product_id.to_string(),
                "quantity": 1,
                "unit_price": 100.0
            }
        ]
    });

let response = client
        .post(format!("http://{}/api/v1/orders", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();

    let status = response.status();
    println!("Order create status: {} (success: {})", status, status.is_success());
    
    assert!(status.is_success() || status.as_u16() == 201, "Status: {}", status);

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert_eq!(body["customer_name"], "Test User");

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_list_orders_empty() {
    let pool = create_test_pool().await.unwrap();
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .get(format!("http://{}/api/v1/orders", addr))
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_order_by_id() {
    let pool = create_test_pool().await.unwrap();
    let category_id = create_test_category(&pool, "TestCat2", &generate_unique_slug("test-cat2")).await.unwrap();
    let product_id = create_test_product(&pool, "TestProd2", &generate_unique_slug("test-prod2"), 75.0, Some(category_id)).await.unwrap();

    // First create an order
    let (temp_handle, temp_client, temp_addr) = spawn_test_server(pool.clone()).await;

    let create_payload = serde_json::json!({
        "customer_name": "Order Test",
        "customer_email": "ordertest@example.com",
        "shipping_address": "Test Address",
        "payment_name": "Card",
        "items": [
            {
                "product_id": product_id.to_string(),
                "quantity": 1,
                "unit_price": 75.0
            }
        ]
    });

    let create_response = temp_client
        .post(format!("http://{}/api/v1/orders", temp_addr))
        .json(&create_payload)
        .send()
        .await
        .unwrap();

    let order: serde_json::Value = create_response.json::<serde_json::Value>().await.unwrap();
    let order_id = order["id"].as_str().unwrap().to_string();

    temp_handle.abort();

    // Now get the order
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .get(format!("http://{}/api/v1/orders/{}", addr, order_id))
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert_eq!(body["customer_name"], "Order Test");

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_update_order_status() {
    let pool = create_test_pool().await.unwrap();
    let category_id = create_test_category(&pool, "Cat3", &generate_unique_slug("cat3")).await.unwrap();
    let product_id = create_test_product(&pool, "Prod3", &generate_unique_slug("prod3"), 50.0, Some(category_id)).await.unwrap();

    // Create order
    let (temp_handle, temp_client, temp_addr) = spawn_test_server(pool.clone()).await;

    let create_payload = serde_json::json!({
        "customer_name": "Status Test",
        "customer_email": "statustest@example.com",
        "shipping_address": "Address",
        "payment_name": "Card",
        "items": [
            {
                "product_id": product_id.to_string(),
                "quantity": 1,
                "unit_price": 50.0
            }
        ]
    });

    let create_response = temp_client
        .post(format!("http://{}/api/v1/orders", temp_addr))
        .json(&create_payload)
        .send()
        .await
        .unwrap();

    let order: serde_json::Value = create_response.json::<serde_json::Value>().await.unwrap();
    let order_id = order["id"].as_str().unwrap().to_string();

    temp_handle.abort();

    // Now update status
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let status_payload = serde_json::json!({
        "status": "shipped"
    });

    let response = client
        .put(format!("http://{}/api/v1/orders/{}", addr, order_id))
        .json(&status_payload)
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert_eq!(body["status"], "shipped");

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_invalid_order_status() {
    let pool = create_test_pool().await.unwrap();
    let category_id = create_test_category(&pool, "Cat4", &generate_unique_slug("cat4")).await.unwrap();
    let product_id = create_test_product(&pool, "Prod4", &generate_unique_slug("prod4"), 50.0, Some(category_id)).await.unwrap();

    // Create order
    let (temp_handle, temp_client, temp_addr) = spawn_test_server(pool.clone()).await;

    let create_payload = serde_json::json!({
        "customer_name": "Invalid Status",
        "customer_email": "invalid@example.com",
        "shipping_address": "Address",
        "payment_name": "Card",
        "items": [
            {
                "product_id": product_id.to_string(),
                "quantity": 1,
                "unit_price": 50.0
            }
        ]
    });

    let create_response = temp_client
        .post(format!("http://{}/api/v1/orders", temp_addr))
        .json(&create_payload)
        .send()
        .await
        .unwrap();

    let order: serde_json::Value = create_response.json::<serde_json::Value>().await.unwrap();
    let order_id = order["id"].as_str().unwrap().to_string();

    temp_handle.abort();

    // Try invalid status
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let status_payload = serde_json::json!({
        "status": "invalid_status"
    });

    let response = client
        .put(format!("http://{}/api/v1/orders/{}", addr, order_id))
        .json(&status_payload)
        .send()
        .await
        .unwrap();

    assert!(response.status().is_client_error());

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}
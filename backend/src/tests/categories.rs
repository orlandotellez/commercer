use crate::shared::state::AppState;
use crate::routes::create_routes;
use crate::tests::helpers::{create_test_pool, cleanup_test_data, create_test_category};
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
async fn test_create_category_success() {
    let pool = create_test_pool().await.unwrap();
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let payload = serde_json::json!({
        "name": "Laptops",
        "slug": generate_unique_slug("laptops"),
        "description": "All kinds of laptops"
    });

    let response = client
        .post(format!("http://{}/api/v1/categories", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success() || response.status().as_u16() == 201);

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert_eq!(body["name"], "Laptops");

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_create_category_duplicate_slug() {
    let pool = create_test_pool().await.unwrap();
    let slug = generate_unique_slug("electronics");
    let _ = create_test_category(&pool, "Electronics", &slug).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let payload = serde_json::json!({
        "name": "Electronic Devices",
        "slug": slug,
        "description": "Duplicate slug test"
    });

    let response = client
        .post(format!("http://{}/api/v1/categories", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();

    assert!(!response.status().is_success());

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_list_categories_empty() {
    let pool = create_test_pool().await.unwrap();
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .get(format!("http://{}/api/v1/categories", addr))
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert!(body.as_array().unwrap().is_empty());

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_list_categories_with_data() {
    let pool = create_test_pool().await.unwrap();
    let _ = create_test_category(&pool, "Computers", &generate_unique_slug("computers")).await.unwrap();
    let _ = create_test_category(&pool, "Phones", &generate_unique_slug("phones")).await.unwrap();
    let _ = create_test_category(&pool, "Tablets", &generate_unique_slug("tablets")).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .get(format!("http://{}/api/v1/categories", addr))
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    let body = response.json::<serde_json::Value>().await.unwrap();
    let categories = body.as_array().unwrap();
    assert_eq!(categories.len(), 3);

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_category_by_id() {
    let pool = create_test_pool().await.unwrap();
    let category_id = create_test_category(&pool, "Gaming", &generate_unique_slug("gaming")).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .get(format!("http://{}/api/v1/categories/{}", addr, category_id))
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert_eq!(body["name"], "Gaming");

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_update_category() {
    let pool = create_test_pool().await.unwrap();
    let category_id = create_test_category(&pool, "Old Name", &generate_unique_slug("old-name")).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let payload = serde_json::json!({
        "name": "New Category Name",
        "description": "Updated description"
    });

    let response = client
        .put(format!("http://{}/api/v1/categories/{}", addr, category_id))
        .json(&payload)
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert_eq!(body["name"], "New Category Name");

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_delete_category() {
    let pool = create_test_pool().await.unwrap();
    let category_id = create_test_category(&pool, "To Delete", &generate_unique_slug("to-delete")).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .delete(format!("http://{}/api/v1/categories/{}", addr, category_id))
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    let get_response = client
        .get(format!("http://{}/api/v1/categories/{}", addr, category_id))
        .send()
        .await
        .unwrap();

    assert_eq!(get_response.status().as_u16(), 404);

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}
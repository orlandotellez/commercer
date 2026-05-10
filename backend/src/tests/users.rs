use crate::shared::helpers::password::hash_password;
use crate::shared::state::AppState;
use crate::routes::create_routes;
use crate::tests::helpers::{create_test_pool, cleanup_test_data, create_test_user};

fn generate_unique_email(prefix: &str) -> String {
    format!("{}_{}@example.com", prefix, uuid::Uuid::new_v4())
}

/// Test helper to spawn the test server
async fn spawn_test_server(db: sqlx::PgPool) -> (tokio::task::JoinHandle<()>, reqwest::Client, std::net::SocketAddr) {
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

#[tokio::test]
async fn test_create_user_success() {
    let pool = create_test_pool().await.unwrap();
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let email = generate_unique_email("create");
    let payload = serde_json::json!({
        "name": "Test User",
        "email": email,
        "password": "password123",
    });

    let response = client
        .post(format!("http://{}/api/v1/users", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success() || response.status().as_u16() == 201);

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert_eq!(body["name"], "Test User");

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_create_user_duplicate_email() {
    let pool = create_test_pool().await.unwrap();
    let (handle1, client1, addr) = spawn_test_server(pool.clone()).await;

    let email = generate_unique_email("duplicate");
    let payload = serde_json::json!({
        "name": "First User",
        "email": email,
        "password": "password123",
    });

    // Create first user
    let _ = client1
        .post(format!("http://{}/api/v1/users", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();
    handle1.abort();

    // Try to create duplicate
    let (handle2, client2, addr2) = spawn_test_server(pool.clone()).await;
    let response = client2
        .post(format!("http://{}/api/v1/users", addr2))
        .json(&payload)
        .send()
        .await
        .unwrap();

    assert!(!response.status().is_success());

    handle2.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_create_user_invalid_role() {
    let pool = create_test_pool().await.unwrap();
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let email = generate_unique_email("invalidrole");
    let payload = serde_json::json!({
        "name": "Test User",
        "email": email,
        "password": "password123",
        "role": "invalid_role"
    });

    let response = client
        .post(format!("http://{}/api/v1/users", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();

    assert!(!response.status().is_success());

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_list_users_empty() {
    let pool = create_test_pool().await.unwrap();
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .get(format!("http://{}/api/v1/users", addr))
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
async fn test_list_users_with_data() {
    let pool = create_test_pool().await.unwrap();

    let password_hash = hash_password("password123").unwrap();
    let _ = create_test_user(&pool, "User One", &generate_unique_email("user1"), "customer", &password_hash).await.unwrap();
    let _ = create_test_user(&pool, "User Two", &generate_unique_email("user2"), "admin", &password_hash).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .get(format!("http://{}/api/v1/users", addr))
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    let body = response.json::<serde_json::Value>().await.unwrap();
    let users = body.as_array().unwrap();
    assert_eq!(users.len(), 2);

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_user_by_id_not_found() {
    let pool = create_test_pool().await.unwrap();
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let fake_id = "550e8400-e29b-41d4-a716-446655440000";

    let response = client
        .get(format!("http://{}/api/v1/users/{}", addr, fake_id))
        .send()
        .await
        .unwrap();

    assert_eq!(response.status().as_u16(), 404);

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_get_user_by_id_success() {
    let pool = create_test_pool().await.unwrap();

    let email = generate_unique_email("getuser");
    let password_hash = hash_password("password123").unwrap();
    let user_id = create_test_user(&pool, "Test User", &email, "admin", &password_hash).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .get(format!("http://{}/api/v1/users/{}", addr, user_id))
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert_eq!(body["email"], email);

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_update_user_success() {
    let pool = create_test_pool().await.unwrap();

    let email = generate_unique_email("update");
    let password_hash = hash_password("password123").unwrap();
    let user_id = create_test_user(&pool, "Old Name", &email, "customer", &password_hash).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let payload = serde_json::json!({
        "name": "New Name",
        "role": "staff"
    });

    let response = client
        .put(format!("http://{}/api/v1/users/{}", addr, user_id))
        .json(&payload)
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert_eq!(body["name"], "New Name");

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_delete_user_success() {
    let pool = create_test_pool().await.unwrap();

    let email = generate_unique_email("delete");
    let password_hash = hash_password("password123").unwrap();
    let user_id = create_test_user(&pool, "To Delete", &email, "customer", &password_hash).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let response = client
        .delete(format!("http://{}/api/v1/users/{}", addr, user_id))
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success());

    // Verify deletion
    let get_response = client
        .get(format!("http://{}/api/v1/users/{}", addr, user_id))
        .send()
        .await
        .unwrap();

    assert_eq!(get_response.status().as_u16(), 404);

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}
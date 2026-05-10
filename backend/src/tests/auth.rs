use crate::shared::helpers::password::hash_password;
use crate::shared::state::AppState;
use crate::routes::create_routes;
use crate::tests::helpers::{create_test_pool, cleanup_test_data, create_test_user};
use std::net::SocketAddr;

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

fn generate_unique_email(prefix: &str) -> String {
    format!("{}_{}@example.com", prefix, uuid::Uuid::new_v4())
}

#[tokio::test]
async fn test_register_new_user() {
    let pool = create_test_pool().await.unwrap();
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let email = generate_unique_email("register");
    let payload = serde_json::json!({
        "name": "New User",
        "email": email,
        "password": "password123"
    });

    let response = client
        .post(format!("http://{}/api/v1/auth/register", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();

    assert!(response.status().is_success() || response.status().as_u16() == 201);

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert_eq!(body["message"], "Usuario registrado exitosamente");

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_register_duplicate_email() {
    let pool = create_test_pool().await.unwrap();

    let email = generate_unique_email("duplicate");
    let password_hash = hash_password("password123").unwrap();
    let _ = create_test_user(&pool, "Existing User", &email, "customer", &password_hash).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let payload = serde_json::json!({
        "name": "New User",
        "email": email,
        "password": "password123"
    });

    let response = client
        .post(format!("http://{}/api/v1/auth/register", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();

    assert!(!response.status().is_success());

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_login_success() {
    let pool = create_test_pool().await.unwrap();

    let email = generate_unique_email("login");
    let password_hash = hash_password("password123").unwrap();
    let _ = create_test_user(&pool, "Login User", &email, "customer", &password_hash).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let payload = serde_json::json!({
        "email": email,
        "password": "password123"
    });

    let response = client
        .post(format!("http://{}/api/v1/auth/login", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();

    println!("Login response status: {}", response.status());
    assert!(response.status().is_success(), "Login failed with status: {}", response.status());

    let body = response.json::<serde_json::Value>().await.unwrap();
    assert!(body.get("access_token").is_some());

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_login_wrong_password() {
    let pool = create_test_pool().await.unwrap();

    let email = generate_unique_email("wrongpass");
    let password_hash = hash_password("correct_password").unwrap();
    let _ = create_test_user(&pool, "Test User", &email, "customer", &password_hash).await.unwrap();

    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let payload = serde_json::json!({
        "email": email,
        "password": "wrong_password"
    });

    let response = client
        .post(format!("http://{}/api/v1/auth/login", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();

    assert_eq!(response.status().as_u16(), 401);

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_login_nonexistent_user() {
    let pool = create_test_pool().await.unwrap();
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let payload = serde_json::json!({
        "email": "nonexistent@example.com",
        "password": "password123"
    });

    let response = client
        .post(format!("http://{}/api/v1/auth/login", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();

    assert_eq!(response.status().as_u16(), 401);

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}

#[tokio::test]
async fn test_login_missing_email() {
    let pool = create_test_pool().await.unwrap();
    let (handle, client, addr) = spawn_test_server(pool.clone()).await;

    let payload = serde_json::json!({
        "password": "password123"
    });

    let response = client
        .post(format!("http://{}/api/v1/auth/login", addr))
        .json(&payload)
        .send()
        .await
        .unwrap();

    assert!(response.status().is_client_error());

    handle.abort();
    cleanup_test_data(&pool).await.unwrap();
}
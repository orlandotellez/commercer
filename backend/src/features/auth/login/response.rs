use chrono::{DateTime, Utc};
use serde::Serialize;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub access_token: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub role: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

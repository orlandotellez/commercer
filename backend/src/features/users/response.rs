use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub email_verified: bool,
    pub created_at: String,
}

#[derive(Debug, Serialize)]
pub struct DeleteResponse {
    pub success: bool,
}

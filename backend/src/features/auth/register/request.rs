use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub name: String,
    pub email: String,
    pub role: String,
    pub password: String,
}

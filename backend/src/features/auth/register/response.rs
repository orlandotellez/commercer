use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct RegisterResponse {
    pub message: String,
}

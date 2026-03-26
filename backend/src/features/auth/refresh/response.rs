use serde::Serialize;

#[derive(Serialize)]
pub struct RefreshResponse {
    pub access_token: String,
}

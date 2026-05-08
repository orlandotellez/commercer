use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct SendEmailResponse {
    pub id: String,
}

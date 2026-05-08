use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct SendEmailRequest {
    pub from: String,
    pub to: Vec<String>,
    pub subject: String,
    pub html: String,
}

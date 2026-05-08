use reqwest::Client;

use crate::{
    features::{
        email::{request::SendEmailRequest, response::SendEmailResponse},
        orders::response::OrderResponse,
    },
    shared::{config::constants::RESEND_API_KEY, templates::email_html::generate_invoice_html},
};

pub struct EmailService;

impl EmailService {
    /// Send invoice email after order creation
    pub async fn send_invoice(order: &OrderResponse) -> Result<String, String> {
        let api_key: String = RESEND_API_KEY.to_string();

        // Determine recipient email and name
        let to_email: String = order
            .customer_email
            .clone()
            .ok_or("No customer email provided")?;

        let recipient_name: String = order
            .customer_name
            .clone()
            .unwrap_or_else(|| "Cliente".to_string());

        // Generate HTML content
        let html: String = generate_invoice_html(order, &recipient_name);

        let request = SendEmailRequest {
            from: "TechComponents <onboarding@resend.dev>".to_string(),
            to: vec![to_email],
            subject: format!("Factura #{}", &order.id[..8].to_uppercase()),
            html,
        };

        let client = Client::new();

        let response = client
            .post("https://api.resend.com/emails")
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| format!("Failed to send email: {}", e))?;

        if response.status().is_success() {
            let result: SendEmailResponse = response
                .json()
                .await
                .map_err(|e| format!("Failed to parse response: {}", e))?;
            Ok(result.id)
        } else {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            Err(format!("Email API error: {} - {}", status, body))
        }
    }
}

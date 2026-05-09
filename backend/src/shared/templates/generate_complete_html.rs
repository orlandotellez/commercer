use crate::{features::orders::response::OrderResponse, shared::helpers::date::format_date};

pub fn generate_completed_html(order: &OrderResponse, customer_name: &str) -> String {
    let formatted_date = order
        .created_at
        .as_ref()
        .map(|d| format_date(d))
        .unwrap_or_else(|| "N/A".to_string());

    format!(
        r#"<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu pedido ha sido entregado</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: #7c3aed; color: #fff; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">✅ Tu pedido ha sido entregado</h1>
            <p style="margin: 4px 0 0; opacity: 0.8;">Pedido #{}</p>
        </div>

        <!-- Customer Info -->
        <div style="padding: 24px;">
            <p><strong>Cliente:</strong> {}</p>
            <p><strong>Fecha de entrega:</strong> {}</p>
        </div>

        <!-- Message -->
        <div style="padding: 0 24px 24px;">
            <p>Tu pedido ha sido entregado exitosamente. ¡Gracias por tu compra!</p>
            <p><strong>Total pagado:</strong> ${:.2}</p>
        </div>

        <!-- Footer -->
        <div style="padding: 24px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p>Gracias por tu compra en TechComponents.</p>
            <p style="margin: 0;">Si tienes alguna duda, contáctanos.</p>
        </div>
    </div>
</body>
</html>"#,
        &order.id[..8].to_uppercase(),
        customer_name,
        formatted_date,
        order.total
    )
}

use crate::{
    features::orders::response::OrderResponse,
    shared::helpers::{date::format_date, email::get_status_text},
};

pub fn generate_invoice_html(order: &OrderResponse, customer_name: &str) -> String {
    let items_html: String = order.items.iter()
            .map(|item| format!(
                r#"<tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">{}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">{}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${:.2}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${:.2}</td>
                </tr>"#,
                item.product_name.as_deref().unwrap_or("Product"),
                item.quantity,
                item.unit_price,
                item.subtotal
            ))
            .collect();

    let subtotal = order.subtotal;
    let taxes = order.taxes;
    let total = order.total;

    // Format date and status
    let formatted_date = order
        .created_at
        .as_ref()
        .map(|d| format_date(d))
        .unwrap_or_else(|| "N/A".to_string());
    let status_text = get_status_text(&order.status);

    format!(
        r#"<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura #{}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: #1a1a2e; color: #fff; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">TechComponents</h1>
            <p style="margin: 4px 0 0; opacity: 0.8;">Factura #{}</p>
        </div>

        <!-- Customer Info -->
        <div style="padding: 24px;">
            <p><strong>Cliente:</strong> {}</p>
            <p><strong>Fecha:</strong> {}</p>
            <p><strong>Estado:</strong> {}</p>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin: 0 24px;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Producto</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Cantidad</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Precio Unit.</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                {}
            </tbody>
        </table>

        <!-- Totals -->
        <div style="padding: 24px; text-align: right;">
            <p style="margin: 8px 0;">
                <strong>Subtotal:</strong> ${:.2}
            </p>
            <p style="margin: 8px 0;">
                <strong>IVA (15%):</strong> ${:.2}
            </p>
            <p style="margin: 8px 0; font-size: 20px; font-weight: bold;">
                <strong>Total:</strong> ${:.2}
            </p>
        </div>

        <!-- Footer -->
        <div style="padding: 24px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p>Gracias por tu compra en TechComponents.</p>
            <p style="margin: 0;">Este es un correo automático, por favor no response.</p>
        </div>
    </div>
</body>
</html>"#,
        &order.id[..8].to_uppercase(),
        &order.id[..8].to_uppercase(),
        customer_name,
        formatted_date,
        status_text,
        items_html,
        subtotal,
        taxes,
        total
    )
}

use crate::{
    features::orders::response::OrderResponse,
    shared::{
        helpers::email::{OrderEmailType, get_email_subject},
        templates::{
            generate_cancelled_html::generate_cancelled_html,
            generate_complete_html::generate_completed_html,
            generate_invoice_html::generate_invoice_html,
            generate_shipped_html::generate_shipped_html,
        },
    },
};

/// Generate the appropriate email based on order status
pub fn generate_status_email(
    order: &OrderResponse,
    customer_name: &str,
    old_status: &str,
    new_status: &str,
) -> Option<(String, String)> {
    // Only send email if status actually changed
    if old_status == new_status {
        return None;
    }

    let (subject, html) = match new_status {
        "shipped" => (
            get_email_subject(&OrderEmailType::Shipped),
            generate_shipped_html(order, customer_name, None),
        ),
        "completed" => (
            get_email_subject(&OrderEmailType::Completed),
            generate_completed_html(order, customer_name),
        ),
        "cancelled" => (
            get_email_subject(&OrderEmailType::Cancelled),
            generate_cancelled_html(order, customer_name, None),
        ),
        // Initial order (from pending to paid/processing)
        _ if old_status == "pending" && (new_status == "paid" || new_status == "processing") => (
            get_email_subject(&OrderEmailType::Invoice),
            generate_invoice_html(order, customer_name),
        ),
        _ => return None,
    };

    Some((subject, html))
}

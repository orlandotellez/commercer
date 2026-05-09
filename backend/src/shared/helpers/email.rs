/// Email type for order status changes
pub enum OrderEmailType {
    Invoice,   // Pedido confirmado/creado
    Shipped,   // Pedido enviado
    Completed, // Pedido completado/entregado
    Cancelled, // Pedido cancelado
}

/// Generate subject line based on email type
pub fn get_email_subject(email_type: &OrderEmailType) -> String {
    match email_type {
        OrderEmailType::Invoice => "Tu pedido ha sido confirmado - TechComponents".to_string(),
        OrderEmailType::Shipped => "Tu pedido ha sido enviado - TechComponents".to_string(),
        OrderEmailType::Completed => "Tu pedido ha sido entregado - TechComponents".to_string(),
        OrderEmailType::Cancelled => "Tu pedido ha sido cancelado - TechComponents".to_string(),
    }
}

/// Get status display text in Spanish
pub fn get_status_text(status: &str) -> &str {
    match status {
        "pending" => "Pendiente",
        "paid" => "Pagado",
        "processing" => "Procesando",
        "shipped" => "Enviado",
        "completed" => "Completado",
        "cancelled" => "Cancelado",
        _ => status,
    }
}

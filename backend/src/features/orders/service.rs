use bigdecimal::{BigDecimal, ToPrimitive};
use uuid::Uuid;

use crate::{
    features::orders::{request::*, response::*},
    shared::{errors::AppError, state::AppState},
};

pub struct OrdersService;

impl OrdersService {
    /// List orders with optional filters
    pub async fn list_orders(
        state: &AppState,
        params: ListOrdersParams,
    ) -> Result<OrdersListResponse, AppError> {
        let page = params.page.unwrap_or(1);
        let limit = params.limit.unwrap_or(10);
        let offset = (page - 1) * limit;

        // Get total count - use simple query_as without branching
        let total: i64 = match &params.user_id {
            Some(uid) => {
                let uuid = Uuid::parse_str(uid)
                    .map_err(|_| AppError::BadRequest("Invalid user_id".into()))?;
                let result: (i64,) =
                    sqlx::query_as("SELECT COUNT(*) FROM orders WHERE user_id = $1")
                        .bind(uuid)
                        .fetch_one(&state.db)
                        .await?;
                result.0
            }
            None => {
                let result: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM orders")
                    .fetch_one(&state.db)
                    .await?;
                result.0
            }
        };

        // Get orders with pagination - use execute then query_as to avoid type mismatch
        let orders = match &params.user_id {
            Some(uid) => {
                let uuid = Uuid::parse_str(uid)
                    .map_err(|_| AppError::BadRequest("Invalid user_id".into()))?;
                let rows: Vec<OrderRow> = sqlx::query_as(
                    "SELECT id::text as id, status, subtotal, taxes, total, user_id::text as user_id, customer_name, customer_email, customer_phone, shipping_address, payment_name, is_guest, created_at::text as created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
                )
                .bind(uuid)
                .bind(limit as i64)
                .bind(offset as i64)
                .fetch_all(&state.db)
                .await?;
                rows
            }
            None => {
                let rows: Vec<OrderRow> = sqlx::query_as(
                    "SELECT id::text as id, status, subtotal, taxes, total, user_id::text as user_id, customer_name, customer_email, customer_phone, shipping_address, payment_name, is_guest, created_at::text as created_at FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2"
                )
                .bind(limit as i64)
                .bind(offset as i64)
                .fetch_all(&state.db)
                .await?;
                rows
            }
        };

        // Helper struct for mapping query results
        #[derive(sqlx::FromRow)]
        struct OrderRow {
            id: Option<String>,
            status: String,
            subtotal: BigDecimal,
            taxes: BigDecimal,
            total: BigDecimal,
            user_id: Option<String>,
            customer_name: Option<String>,
            customer_email: Option<String>,
            customer_phone: Option<String>,
            shipping_address: Option<String>,
            payment_name: Option<String>,
            is_guest: Option<bool>,
            created_at: Option<String>,
        }

        // Get items for each order
        let mut order_responses = Vec::new();
        for order in orders {
            let order_id = order.id.clone().unwrap_or_default();
            let items = Self::get_order_items(&state.db, &order_id).await?;
            order_responses.push(OrderResponse {
                id: order_id,
                status: order.status,
                subtotal: order.subtotal.to_f64().unwrap_or(0.0),
                taxes: order.taxes.to_f64().unwrap_or(0.0),
                total: order.total.to_f64().unwrap_or(0.0),
                user_id: order.user_id,
                customer_name: order.customer_name,
                customer_email: order.customer_email,
                customer_phone: order.customer_phone,
                shipping_address: order.shipping_address,
                payment_name: order.payment_name,
                is_guest: order.is_guest,
                created_at: order.created_at.clone(),
                items,
            });
        }

        let response: OrdersListResponse = OrdersListResponse {
            orders: order_responses,
            total,
            page,
            limit,
        };

        Ok(response)
    }

    /// Get order items by order_id
    async fn get_order_items(
        db: &sqlx::PgPool,
        order_id: &str,
    ) -> Result<Vec<OrderItemResponse>, AppError> {
        let order_uuid = Uuid::parse_str(order_id)
            .map_err(|_| AppError::BadRequest("Invalid order ID".into()))?;

        let items = sqlx::query!(
            r#"
            SELECT 
                oi.id::text as "id",
                oi.product_id::text as "product_id",
                p.name as "product_name",
                oi.quantity,
                oi.unit_price,
                oi.subtotal
            FROM order_items oi
            LEFT JOIN product p ON p.id = oi.product_id
            WHERE oi.order_id = $1
            "#,
            order_uuid
        )
        .fetch_all(db)
        .await?;

        let response: Vec<OrderItemResponse> = items
            .into_iter()
            .map(|i| OrderItemResponse {
                id: i.id.unwrap_or_default(),
                product_id: i.product_id.unwrap_or_default(),
                product_name: Some(i.product_name),
                quantity: i.quantity,
                unit_price: i.unit_price.to_f64().unwrap_or(0.0),
                subtotal: i.subtotal.to_f64().unwrap_or(0.0),
            })
            .collect();

        Ok(response)
    }

    /// Get a single order by ID
    pub async fn get_order(state: &AppState, id: Uuid) -> Result<OrderResponse, AppError> {
        let order = sqlx::query!(
            r#"
            SELECT 
                id::text as "id",
                status,
                subtotal,
                taxes,
                total,
                user_id::text as "user_id",
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                payment_name,
                is_guest,
                created_at::text as "created_at"
            FROM orders
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Order not found".into()))?;

        let order_id = order.id.clone().unwrap_or_default();
        let items = Self::get_order_items(&state.db, &order_id).await?;

        let response: OrderResponse = OrderResponse {
            id: order_id,
            status: order.status,
            subtotal: order.subtotal.to_f64().unwrap_or(0.0),
            taxes: order.taxes.to_f64().unwrap_or(0.0),
            total: order.total.to_f64().unwrap_or(0.0),
            user_id: order.user_id,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            customer_phone: order.customer_phone,
            shipping_address: order.shipping_address,
            payment_name: order.payment_name,
            is_guest: order.is_guest,
            created_at: order.created_at.clone(),
            items,
        };

        Ok(response)
    }

    /// Create a new order with items
    pub async fn create_order(
        state: &AppState,
        payload: CreateOrderRequest,
    ) -> Result<OrderResponse, AppError> {
        let order_id = Uuid::new_v4();

        // Calculate totals
        let subtotal: f64 = payload
            .items
            .iter()
            .map(|i| i.unit_price * i.quantity as f64)
            .sum();
        let taxes = (subtotal * 0.15 * 100.0).round() / 100.0; // 15% IVA rounded
        let total = subtotal + taxes;

        // Convert to DECIMAL for database (already rounded)
        let subtotal_bd =
            BigDecimal::from((subtotal * 100.0).round() as i64) / BigDecimal::from(100);
        let taxes_bd = BigDecimal::from((taxes * 100.0).round() as i64) / BigDecimal::from(100);
        let total_bd = BigDecimal::from((total * 100.0).round() as i64) / BigDecimal::from(100);

        // Parse user_id and determine if guest
        let (parsed_user_id, is_guest) = match &payload.user_id {
            Some(uid) if !uid.is_empty() && !uid.starts_with("temp-") => {
                // Valid UUID = logged in user
                (Uuid::parse_str(uid).ok(), false)
            }
            _ => {
                // No user_id or temp ID = guest
                (None, true)
            }
        };

        // Insert order with customer data
        let order = sqlx::query!(
            r#"
            INSERT INTO orders (id, status, subtotal, taxes, total, user_id, customer_name, customer_email, customer_phone, shipping_address, payment_name, is_guest)
            VALUES ($1, 'pending', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING 
                id::text as "id",
                status,
                subtotal,
                taxes,
                total,
                user_id::text as "user_id",
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                payment_name,
                is_guest,
                created_at::text as "created_at"
            "#,
            order_id,
            subtotal_bd,
            taxes_bd,
            total_bd,
            parsed_user_id,
            payload.customer_name,
            payload.customer_email,
            payload.customer_phone,
            payload.shipping_address,
            payload.payment_name,
            is_guest
        )
        .fetch_one(&state.db)
        .await?;

        // Validar stock disponible antes de procesar
        for item in &payload.items {
            let product_id = Uuid::parse_str(&item.product_id)
                .map_err(|_| AppError::BadRequest("Invalid product_id".into()))?;

            // First check if product exists
            let product = sqlx::query!("SELECT name FROM product WHERE id = $1", product_id)
                .fetch_optional(&state.db)
                .await?;

            let product_name = match product {
                Some(p) => p.name,
                None => {
                    return Err(AppError::BadRequest(format!(
                        "Producto {} no encontrado",
                        item.product_id
                    )));
                }
            };

            // Check inventory for stock
            let inventory = sqlx::query!(
                r#"
                SELECT i.stock_current 
                FROM inventory i 
                WHERE i.product_id = $1
                "#,
                product_id
            )
            .fetch_optional(&state.db)
            .await?;

            if let Some(inv) = inventory {
                if inv.stock_current < item.quantity as i32 {
                    return Err(AppError::BadRequest(format!(
                        "Stock insuficiente para '{}'. Disponible: {}, solicitado: {}",
                        product_name, inv.stock_current, item.quantity
                    )));
                }
            }
            // Si no hay inventario, asumimos stock suficiente (producto sin control de inventario)
        }

        // Insert order items
        let mut items = Vec::new();
        for item in payload.items {
            let product_id = Uuid::parse_str(&item.product_id)
                .map_err(|_| AppError::BadRequest("Invalid product_id".into()))?;
            let item_subtotal = item.unit_price * item.quantity as f64;
            let item_subtotal_bd =
                BigDecimal::from((item_subtotal * 100.0) as i64) / BigDecimal::from(100);
            let unit_price_bd =
                BigDecimal::from((item.unit_price * 100.0) as i64) / BigDecimal::from(100);

            let order_item = sqlx::query!(
                r#"
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING 
                    id::text as "id",
                    product_id::text as "product_id"
                "#,
                order_id,
                product_id,
                item.quantity,
                unit_price_bd,
                item_subtotal_bd
            )
            .fetch_one(&state.db)
            .await?;

            // Decrementar stock del producto
            println!(
                ">>> decrementando stock para producto {} cantidad {}",
                product_id, item.quantity
            );
            let result = sqlx::query!(
                r#"
                UPDATE product 
                SET stock = stock - $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                "#,
                item.quantity,
                product_id
            )
            .execute(&state.db)
            .await;

            if let Err(e) = result {
                eprintln!(
                    "Error decrementando stock para producto {}: {}",
                    product_id, e
                );
            } else {
                println!(
                    ">>> stock decrementado exitosamente para producto {}",
                    product_id
                );
            }

            // Get product name
            let product = sqlx::query!("SELECT name FROM product WHERE id = $1", product_id)
                .fetch_optional(&state.db)
                .await?;

            items.push(OrderItemResponse {
                id: order_item.id.unwrap_or_default(),
                product_id: order_item.product_id.unwrap_or_default(),
                product_name: product.map(|p| p.name),
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item_subtotal,
            });
        }

        let response: OrderResponse = OrderResponse {
            id: order.id.unwrap_or_default(),
            status: order.status,
            subtotal: order.subtotal.to_f64().unwrap_or(0.0),
            taxes: order.taxes.to_f64().unwrap_or(0.0),
            total: order.total.to_f64().unwrap_or(0.0),
            user_id: order.user_id,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            customer_phone: order.customer_phone,
            shipping_address: order.shipping_address,
            payment_name: order.payment_name,
            is_guest: order.is_guest,
            created_at: order.created_at.clone(),
            items,
        };

        Ok(response)
    }

    /// Update order status
    pub async fn update_order_status(
        state: &AppState,
        id: Uuid,
        payload: UpdateOrderStatusRequest,
    ) -> Result<OrderResponse, AppError> {
        let valid_statuses = vec![
            "pending",
            "paid",
            "processing",
            "shipped",
            "completed",
            "cancelled",
        ];
        if !valid_statuses.contains(&payload.status.as_str()) {
            return Err(AppError::BadRequest("Invalid status".into()));
        }

        // First get the current status (old status)
        let old_order: Option<(String,)> =
            sqlx::query_as("SELECT status FROM orders WHERE id = $1")
                .bind(id)
                .fetch_optional(&state.db)
                .await?;

        let old_status = old_order
            .map(|(s,)| s)
            .unwrap_or_else(|| "pending".to_string());

        let order = sqlx::query!(
            r#"
            UPDATE orders SET status = $1
            WHERE id = $2
            RETURNING 
                id::text as "id",
                status,
                subtotal,
                taxes,
                total,
                user_id::text as "user_id",
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                payment_name,
                is_guest,
                created_at::text as "created_at"
            "#,
            payload.status,
            id
        )
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Order not found".into()))?;

        let order_id = order.id.clone().unwrap_or_default();
        let items = Self::get_order_items(&state.db, &order_id).await?;

        let order_response = OrderResponse {
            id: order_id.clone(),
            status: order.status.clone(),
            subtotal: order.subtotal.to_f64().unwrap_or(0.0),
            taxes: order.taxes.to_f64().unwrap_or(0.0),
            total: order.total.to_f64().unwrap_or(0.0),
            user_id: order.user_id.clone(),
            customer_name: order.customer_name.clone(),
            customer_email: order.customer_email.clone(),
            customer_phone: order.customer_phone.clone(),
            shipping_address: order.shipping_address.clone(),
            payment_name: order.payment_name.clone(),
            is_guest: order.is_guest,
            created_at: order.created_at.clone(),
            items,
        };

        // Send status update email asynchronously (fire and forget)
        let order_for_email = order_response.clone();
        let old_status_clone = old_status.clone();
        let new_status = order.status.clone();

        tokio::spawn(async move {
            use crate::features::email::service::EmailService;

            let _ =
                EmailService::send_status_update(&order_for_email, &old_status_clone, &new_status)
                    .await;
        });

        Ok(order_response)
    }

    /// Delete an order
    pub async fn delete_order(state: &AppState, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query!("DELETE FROM orders WHERE id = $1", id)
            .execute(&state.db)
            .await?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Order not found".into()));
        }

        Ok(())
    }
}

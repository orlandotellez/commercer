use bigdecimal::{BigDecimal, ToPrimitive};
use uuid::Uuid;

use crate::{
    features::orders::{request::*, response::*},
    shared::{errors::AppError, state::DbState},
};

pub struct OrdersService;

impl OrdersService {
    /// List orders with optional filters
    pub async fn list_orders(
        db: &DbState,
        params: ListOrdersParams,
    ) -> Result<OrdersListResponse, AppError> {
        let page = params.page.unwrap_or(1);
        let limit = params.limit.unwrap_or(10);
        let offset = (page - 1) * limit;

        // Get total count
        let count_result: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM orders")
            .fetch_one(db)
            .await?;
        let total = count_result.0;

        // Get orders with pagination
        let orders = sqlx::query!(
            r#"
            SELECT 
                id::text as "id",
                user_id::text as "user_id",
                status,
                subtotal,
                taxes,
                total,
                created_at::text as "created_at"
            FROM orders
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            "#,
            limit as i64,
            offset as i64
        )
        .fetch_all(db)
        .await?;

        // Get items for each order
        let mut order_responses = Vec::new();
        for order in orders {
            let order_id = order.id.clone().unwrap_or_default();
            let items = Self::get_order_items(db, &order_id).await?;
            order_responses.push(OrderResponse {
                id: order_id,
                user_id: order.user_id.unwrap_or_default(),
                status: order.status,
                subtotal: order.subtotal.to_f64().unwrap_or(0.0),
                taxes: order.taxes.to_f64().unwrap_or(0.0),
                total: order.total.to_f64().unwrap_or(0.0),
                created_at: order.created_at.clone(),
                items,
            });
        }

        Ok(OrdersListResponse {
            orders: order_responses,
            total,
            page,
            limit,
        })
    }

    /// Get order items by order_id
    async fn get_order_items(db: &DbState, order_id: &str) -> Result<Vec<OrderItemResponse>, AppError> {
        let order_uuid = Uuid::parse_str(order_id).map_err(|_| AppError::BadRequest("Invalid order ID".into()))?;
        
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

        Ok(items
            .into_iter()
            .map(|i| OrderItemResponse {
                id: i.id.unwrap_or_default(),
                product_id: i.product_id.unwrap_or_default(),
                product_name: Some(i.product_name),
                quantity: i.quantity,
                unit_price: i.unit_price.to_f64().unwrap_or(0.0),
                subtotal: i.subtotal.to_f64().unwrap_or(0.0),
            })
            .collect())
    }

    /// Get a single order by ID
    pub async fn get_order(db: &DbState, id: Uuid) -> Result<OrderResponse, AppError> {
        let order = sqlx::query!(
            r#"
            SELECT 
                id::text as "id",
                user_id::text as "user_id",
                status,
                subtotal,
                taxes,
                total,
                created_at::text as "created_at"
            FROM orders
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(db)
        .await?
        .ok_or_else(|| AppError::NotFound("Order not found".into()))?;

        let order_id = order.id.clone().unwrap_or_default();
        let items = Self::get_order_items(db, &order_id).await?;

        Ok(OrderResponse {
            id: order_id,
            user_id: order.user_id.unwrap_or_default(),
            status: order.status,
            subtotal: order.subtotal.to_f64().unwrap_or(0.0),
            taxes: order.taxes.to_f64().unwrap_or(0.0),
            total: order.total.to_f64().unwrap_or(0.0),
            created_at: order.created_at.clone(),
            items,
        })
    }

    /// Create a new order with items
    pub async fn create_order(
        db: &DbState,
        payload: CreateOrderRequest,
    ) -> Result<OrderResponse, AppError> {
        let order_id = Uuid::new_v4();
        
        // Verificar o crear usuario guest
        let user_id = Uuid::parse_str(&payload.user_id)
            .map_err(|_| AppError::BadRequest("Invalid user_id".into()))?;
        
        // Verificar si el usuario existe
        let user_exists = sqlx::query!("SELECT id FROM users WHERE id = $1", user_id)
            .fetch_optional(db)
            .await?
            .is_some();
        
        // Si no existe, crear un usuario guest
        //  let final_user_id = if !user_exists {
        //      let guest_id = Uuid::new_v4();
        //      sqlx::query!(
        //          r#"
        //          INSERT INTO users (id, name, email, role, email_verified)
        //          VALUES ($1, 'Guest User', 'guest@localhost', 'customer', false)
        //          "#,
        //          guest_id
        //      )
        //      .execute(db)
        //      .await?;
        //      guest_id
      //  } else {
      //      user_id
      //  };

        // Calculate totals
        let subtotal: f64 = payload.items.iter().map(|i| i.unit_price * i.quantity as f64).sum();
        let taxes = subtotal * 0.21; // 21% IVA
        let total = subtotal + taxes;

        // Convert to DECIMAL for database
        let subtotal_bd = BigDecimal::from((subtotal * 100.0) as i64) / BigDecimal::from(100);
        let taxes_bd = BigDecimal::from((taxes * 100.0) as i64) / BigDecimal::from(100);
        let total_bd = BigDecimal::from((total * 100.0) as i64) / BigDecimal::from(100);

        // Insert order
        let order = sqlx::query!(
            r#"
            INSERT INTO orders (id, user_id, status, subtotal, taxes, total)
            VALUES ($1, $2, 'pending', $3, $4, $5)
            RETURNING 
                id::text as "id",
                user_id::text as "user_id",
                status,
                subtotal,
                taxes,
                total,
                created_at::text as "created_at"
            "#,
            order_id,
            final_user_id,
            subtotal_bd,
            taxes_bd,
            total_bd
        )
        .fetch_one(db)
        .await?;

        // Insert order items
        let mut items = Vec::new();
        for item in payload.items {
            let product_id = Uuid::parse_str(&item.product_id)
                .map_err(|_| AppError::BadRequest("Invalid product_id".into()))?;
            let item_subtotal = item.unit_price * item.quantity as f64;
            let item_subtotal_bd = BigDecimal::from((item_subtotal * 100.0) as i64) / BigDecimal::from(100);
            let unit_price_bd = BigDecimal::from((item.unit_price * 100.0) as i64) / BigDecimal::from(100);

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
            .fetch_one(db)
            .await?;

            // Get product name
            let product = sqlx::query!(
                "SELECT name FROM product WHERE id = $1",
                product_id
            )
            .fetch_optional(db)
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

        Ok(OrderResponse {
            id: order.id.unwrap_or_default(),
            user_id: order.user_id.unwrap_or_default(),
            status: order.status,
            subtotal: order.subtotal.to_f64().unwrap_or(0.0),
            taxes: order.taxes.to_f64().unwrap_or(0.0),
            total: order.total.to_f64().unwrap_or(0.0),
            created_at: order.created_at.clone(),
            items,
        })
    }

    /// Update order status
    pub async fn update_order_status(
        db: &DbState,
        id: Uuid,
        payload: UpdateOrderStatusRequest,
    ) -> Result<OrderResponse, AppError> {
        let valid_statuses = vec!["pending", "paid", "processing", "shipped", "completed", "cancelled"];
        if !valid_statuses.contains(&payload.status.as_str()) {
            return Err(AppError::BadRequest("Invalid status".into()));
        }

        let order = sqlx::query!(
            r#"
            UPDATE orders SET status = $1
            WHERE id = $2
            RETURNING 
                id::text as "id",
                user_id::text as "user_id",
                status,
                subtotal,
                taxes,
                total,
                created_at::text as "created_at"
            "#,
            payload.status,
            id
        )
        .fetch_optional(db)
        .await?
        .ok_or_else(|| AppError::NotFound("Order not found".into()))?;

        let order_id = order.id.clone().unwrap_or_default();
        let items = Self::get_order_items(db, &order_id).await?;

        Ok(OrderResponse {
            id: order_id,
            user_id: order.user_id.unwrap_or_default(),
            status: order.status,
            subtotal: order.subtotal.to_f64().unwrap_or(0.0),
            taxes: order.taxes.to_f64().unwrap_or(0.0),
            total: order.total.to_f64().unwrap_or(0.0),
            created_at: order.created_at.clone(),
            items,
        })
    }

    /// Delete an order
    pub async fn delete_order(db: &DbState, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query!("DELETE FROM orders WHERE id = $1", id)
            .execute(db)
            .await?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Order not found".into()));
        }

        Ok(())
    }
}
use bigdecimal::{BigDecimal, ToPrimitive};
use sqlx::Row;

use crate::{
    features::dashboard::response::*,
    shared::{errors::AppError, helpers::equations::calculate_change, state::AppState},
};

pub struct DashboardService;

impl DashboardService {
    /// Calculate KPIs: total_sales, completed_sales, pending_sales, total_orders, total_users, total_products
    /// Also calculates change percentage vs previous period
    /// Returns: (KPI items, total_sales, completed_sales, pending_sales) as tuple
    pub async fn get_kpis(
        state: &AppState,
    ) -> Result<(Vec<KPIItem>, BigDecimal, BigDecimal, BigDecimal), AppError> {
        // Get all sales values
        let (total_sales,): (BigDecimal,) = sqlx::query_as(
            "SELECT COALESCE(SUM(total), 0) FROM orders WHERE created_at >= NOW() - INTERVAL '30 days'"
        )
        .fetch_one(&state.db)
        .await?;

        let (completed_sales,): (BigDecimal,) = sqlx::query_as(
            "SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '30 days'"
        )
        .fetch_one(&state.db)
        .await?;

        let (pending_sales,): (BigDecimal,) = sqlx::query_as(
            "SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'pending' AND created_at >= NOW() - INTERVAL '30 days'"
        )
        .fetch_one(&state.db)
        .await?;

        // Existing counts...
        let (total_orders,): (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM orders WHERE created_at >= NOW() - INTERVAL '30 days'",
        )
        .fetch_one(&state.db)
        .await?;

        // ... rest of the function (copy from existing code)
        let (total_users,): (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days'",
        )
        .fetch_one(&state.db)
        .await?;

        let (total_products,): (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM product WHERE COALESCE(active, false) = true")
                .fetch_one(&state.db)
                .await?;

        // Query for previous period (30-60 days ago) for comparison
        let (prev_sales,): (BigDecimal,) = sqlx::query_as(
            "SELECT COALESCE(SUM(total), 0) FROM orders WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'"
        )
        .fetch_one(&state.db)
        .await?;

        let (prev_orders,): (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM orders WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'"
        )
        .fetch_one(&state.db)
        .await?;

        let (prev_users,): (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'"
        )
        .fetch_one(&state.db)
        .await?;

        // Calculate changes
        let sales_change = calculate_change(
            total_sales.to_f64().unwrap_or(0.0),
            prev_sales.to_f64().unwrap_or(0.0),
        );
        let orders_change = calculate_change(total_orders as f64, prev_orders as f64);
        let users_change = calculate_change(total_users as f64, prev_users as f64);

        // Format values
        let sales_value = format!("${:.2}", total_sales.to_f64().unwrap_or(0.0));
        let orders_value = format!("{}", total_orders);
        let users_value = format!("{}", total_users);
        let products_value = format!("{}", total_products);

        let kpis = vec![
            KPIItem {
                title: "Total Sales".to_string(),
                value: sales_value,
                change: format!("{}%", sales_change),
                trend: if sales_change >= 0 {
                    "up".to_string()
                } else {
                    "down".to_string()
                },
            },
            KPIItem {
                title: "Total Orders".to_string(),
                value: orders_value,
                change: format!("{}%", orders_change),
                trend: if orders_change >= 0 {
                    "up".to_string()
                } else {
                    "down".to_string()
                },
            },
            KPIItem {
                title: "Total Users".to_string(),
                value: users_value,
                change: format!("{}%", users_change),
                trend: if users_change >= 0 {
                    "up".to_string()
                } else {
                    "down".to_string()
                },
            },
            KPIItem {
                title: "Total Products".to_string(),
                value: products_value,
                change: "0%".to_string(),
                trend: "up".to_string(),
            },
        ];

        Ok((kpis, total_sales, completed_sales, pending_sales))
    }

    /// Get sales data grouped by period (day/week/month)
    /// Returns last 7 days, 4 weeks, or 12 months based on period
    pub async fn get_sales_by_period(
        state: &AppState,
        period: &str,
    ) -> Result<Vec<SalesDataPoint>, AppError> {
        let (date_trunc, interval) = match period {
            "day" => ("day", "7 days"),
            "week" => ("week", "4 weeks"),
            "month" => ("month", "12 months"),
            _ => {
                return Err(AppError::BadRequest(
                    "Invalid period. Use: day, week, month".to_string(),
                ));
            }
        };

        let query = format!(
            r#"
            SELECT 
                DATE_TRUNC('{}', created_at)::text as period,
                COALESCE(SUM(total), 0) as total
            FROM orders 
            WHERE created_at >= NOW() - INTERVAL '{}'
            GROUP BY DATE_TRUNC('{}', created_at)
            ORDER BY period
            "#,
            date_trunc, interval, date_trunc
        );

        let rows = sqlx::query(&query).fetch_all(&state.db).await?;

        let mut result = Vec::new();
        for row in rows {
            let period_str: String = row.try_get("period")?;
            let total: BigDecimal = row.try_get("total")?;

            // Format label based on period
            let label = if period == "day" {
                period_str.chars().take(10).collect() // YYYY-MM-DD
            } else if period == "week" {
                format!(
                    "Week of {}",
                    period_str.chars().take(10).collect::<String>()
                )
            } else {
                format!("{}", period_str.chars().take(7).collect::<String>()) // YYYY-MM
            };

            result.push(SalesDataPoint {
                label,
                value: total.to_f64().unwrap_or(0.0),
            });
        }

        Ok(result)
    }

    /// Get top 5 products by sales volume
    pub async fn get_top_products(state: &AppState) -> Result<Vec<TopProduct>, AppError> {
        let products = sqlx::query!(
            r#"
            SELECT 
                p.name,
                SUM(oi.quantity) as "sales!",
                SUM(oi.subtotal) as "revenue!"
            FROM order_items oi
            JOIN product p ON p.id = oi.product_id
            JOIN orders o ON o.id = oi.order_id
            WHERE o.status = 'completed'
            GROUP BY p.id, p.name
            ORDER BY "sales!" DESC
            LIMIT 5
            "#
        )
        .fetch_all(&state.db)
        .await?;

        Ok(products
            .into_iter()
            .map(|p| TopProduct {
                name: p.name,
                sales: p.sales,
                revenue: format!("${:.2}", p.revenue.to_f64().unwrap_or(0.0)),
            })
            .collect())
    }

    /// Get inventory alerts - only products with stock <= 10
    pub async fn get_inventory_alerts(state: &AppState) -> Result<Vec<InventoryAlert>, AppError> {
        let alerts = sqlx::query!(
            r#"
            SELECT 
                p.name as product,
                COALESCE(i.stock_current, p.stock, 10) as "stock!",
                COALESCE(i.stock_minimum, 5) as "threshold!"
            FROM product p
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE COALESCE(i.stock_current, p.stock, 10) <= 10
            ORDER BY COALESCE(i.stock_current, p.stock, 10) ASC
            LIMIT 10
            "#
        )
        .fetch_all(&state.db)
        .await?;

        Ok(alerts
            .into_iter()
            .map(|a| {
                let threshold = a.threshold;
                let stock = a.stock;
                let urgent = stock <= 3; // Urgent if stock is 3 or less
                InventoryAlert {
                    product: a.product,
                    stock,
                    threshold,
                    urgent,
                }
            })
            .collect())
    }

    /// Get latest 4 orders with product names using JOIN and ARRAY_AGG
    pub async fn get_recent_orders(state: &AppState) -> Result<Vec<RecentOrder>, AppError> {
        let orders = sqlx::query!(
            r#"
            SELECT 
                o.id::text as "id!",
                o.total as "total!",
                o.status as "status!",
                o.created_at::text as "date!",
                COALESCE(
                    ARRAY_AGG(p.name ORDER BY o.created_at) FILTER (WHERE p.name IS NOT NULL),
                    ARRAY[]::text[]
                ) as "products!",
                CASE 
                    WHEN COUNT(p.name) > 3 THEN true 
                    ELSE false 
                END as "has_more!"
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN product p ON p.id = oi.product_id
            GROUP BY o.id, o.total, o.status, o.created_at
            ORDER BY o.created_at DESC
            LIMIT 4
            "#
        )
        .fetch_all(&state.db)
        .await?;

        Ok(orders
            .into_iter()
            .map(|o| RecentOrder {
                id: o.id,
                products: o.products,
                has_more: o.has_more,
                total: format!("${:.2}", o.total.to_f64().unwrap_or(0.0)),
                status: o.status,
                date: o.date,
            })
            .collect())
    }
}

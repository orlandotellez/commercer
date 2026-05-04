use serde::Serialize;

/// KPI item for dashboard overview cards
#[derive(Debug, Serialize)]
pub struct KPIItem {
    pub title: String,
    pub value: String,
    pub change: String,
    pub trend: String, // "up" or "down"
}

/// Sales data point for chart visualization
#[derive(Debug, Serialize)]
pub struct SalesDataPoint {
    pub label: String,
    pub value: f64,
}

/// Recent order for dashboard table
#[derive(Debug, Serialize)]
pub struct RecentOrder {
    pub id: String,
    pub products: Vec<String>,
    pub has_more: bool,
    pub total: String,
    pub status: String,
    pub date: String,
}

/// Inventory alert for low stock products
#[derive(Debug, Serialize)]
pub struct InventoryAlert {
    pub product: String,
    pub stock: i32,
    pub threshold: i32,
    pub urgent: bool,
}

/// Top selling product
#[derive(Debug, Serialize)]
pub struct TopProduct {
    pub name: String,
    pub sales: i64,
    pub revenue: String,
}

/// Complete dashboard response
#[derive(Debug, Serialize)]
pub struct DashboardResponse {
    pub kpis: Vec<KPIItem>,
    pub sales_chart: Vec<SalesDataPoint>,
    pub recent_orders: Vec<RecentOrder>,
    pub inventory_alerts: Vec<InventoryAlert>,
    pub top_products: Vec<TopProduct>,
    pub total_sales: f64,
    pub completed_sales: f64,
    pub pending_sales: f64,
}

use axum::{
    extract::{Query, State},
    response::Json,
};

use crate::{
    features::dashboard::{
        response::{DashboardResponse, SalesDataPoint},
        service::DashboardService,
    },
    shared::{errors::AppError, state::AppState},
};

use bigdecimal::ToPrimitive;

#[derive(Debug, serde::Deserialize)]
pub struct DashboardQuery {
    pub period: Option<String>,
}

pub async fn get_dashboard(
    State(state): State<AppState>,
    Query(params): Query<DashboardQuery>,
) -> Result<Json<DashboardResponse>, AppError> {
    // Validate and default period parameter
    let period = params.period.unwrap_or_else(|| "month".to_string());
    if !["day", "week", "month"].contains(&period.as_str()) {
        return Err(AppError::BadRequest(
            "Invalid period. Use: day, week, month".to_string(),
        ));
    }

    // Fetch all dashboard data concurrently
    let (kpis_result, sales_chart, top_products, inventory_alerts, recent_orders) = tokio::join!(
        DashboardService::get_kpis(&state),
        DashboardService::get_sales_by_period(&state, &period),
        DashboardService::get_top_products(&state),
        DashboardService::get_inventory_alerts(&state),
        DashboardService::get_recent_orders(&state)
    );

    // Destructure the tuple from get_kpis result
    let (kpis, total_sales, completed_sales, pending_sales) = kpis_result?;

    let response = DashboardResponse {
        kpis,
        sales_chart: sales_chart?,
        recent_orders: recent_orders?,
        inventory_alerts: inventory_alerts?,
        top_products: top_products?,
        total_sales: total_sales.to_f64().unwrap_or(0.0),
        completed_sales: completed_sales.to_f64().unwrap_or(0.0),
        pending_sales: pending_sales.to_f64().unwrap_or(0.0),
    };

    Ok(Json(response))
}

pub async fn get_dashboard_chart(
    State(state): State<AppState>,
    Query(params): Query<DashboardQuery>,
) -> Result<Json<Vec<SalesDataPoint>>, AppError> {
    // Validate and default period parameter
    let period = params.period.unwrap_or_else(|| "month".to_string());
    if !["day", "week", "month"].contains(&period.as_str()) {
        return Err(AppError::BadRequest(
            "Invalid period. Use: day, week, month".to_string(),
        ));
    }

    let chart_data = DashboardService::get_sales_by_period(&state, &period).await?;
    Ok(Json(chart_data))
}

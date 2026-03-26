use axum::{Json, extract::State};
use axum_extra::extract::cookie::CookieJar;

use crate::{
    features::auth::refresh::{response::RefreshResponse, service::RefreshService},
    shared::{errors::AppError, helpers::cookies::build_session_cookie, state::DbState},
};

pub async fn refresh(
    jar: CookieJar,
    State(db): State<DbState>,
) -> Result<(CookieJar, Json<RefreshResponse>), AppError> {
    let refresh_token = jar
        .get("refresh_token")
        .ok_or(AppError::Unauthorized("No session".into()))?
        .value()
        .to_string();

    let result = RefreshService::refresh(&db, refresh_token).await?;

    let cookie = build_session_cookie(result.refresh_token);

    let response = RefreshResponse {
        access_token: result.access_token,
    };

    Ok((jar.add(cookie), Json(response)))
}

use crate::{
    features::auth::login::{
        request::LoginRequest,
        response::{LoginResponse, UserResponse},
        service::{LoginResult, LoginService},
    },
    shared::{errors::AppError, helpers::cookies::build_session_cookie, state::DbState},
};
use axum::{Json, extract::State};
use axum_extra::extract::cookie::CookieJar;

pub async fn login_user(
    jar: CookieJar,
    State(db): State<DbState>,
    Json(payload): Json<LoginRequest>,
) -> Result<(CookieJar, Json<LoginResponse>), AppError> {
    let result: LoginResult = LoginService::login_user(&db, payload).await?;

    let cookie = build_session_cookie(result.refresh_token);

    let response: LoginResponse = LoginResponse {
        access_token: result.access_token,
        user: UserResponse {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            created_at: result.user.created_at,
        },
    };

    Ok((jar.add(cookie), Json(response)))
}

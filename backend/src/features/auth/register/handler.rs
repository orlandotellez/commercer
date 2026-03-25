use axum::{Json, extract::State};

use crate::{
    features::auth::register::{
        request::RegisterRequest, response::RegisterResponse, service::RegisterService,
    },
    shared::{errors::AppError, models::user_model::User, state::DbState},
};

pub async fn register_user(
    State(db): State<DbState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<RegisterResponse>, AppError> {
    let user: User = RegisterService::register_user(&db, payload).await?;

    let response: RegisterResponse = RegisterResponse {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
    };

    Ok(Json(response))
}

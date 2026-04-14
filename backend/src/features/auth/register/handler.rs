use axum::{Json, extract::State};

use crate::{
    features::auth::register::{
        request::RegisterRequest, response::RegisterResponse, service::RegisterService,
    },
    shared::{errors::AppError, state::DbState},
};

pub async fn register_user(
    State(db): State<DbState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<RegisterResponse>, AppError> {
    RegisterService::register_user(&db, payload).await?;

    let response: RegisterResponse = RegisterResponse {
        message: "Usuario registrado exitosamente".to_string(),
    };

    Ok(Json(response))
}

use axum::{Json, extract::State};

use crate::{
    features::auth::register::{
        request::RegisterRequest, response::RegisterResponse, service::RegisterService,
    },
    shared::{errors::AppError, state::AppState},
};

pub async fn register_user(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<RegisterResponse>, AppError> {
    RegisterService::register_user(&state, payload).await?;

    let response: RegisterResponse = RegisterResponse {
        message: "Usuario registrado exitosamente".to_string(),
    };

    Ok(Json(response))
}

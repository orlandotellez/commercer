use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde_json::json;

#[derive(Debug)]
#[allow(dead_code)]
pub enum AppError {
    NotFound(String),
    BadRequest(String),
    InternalServerError(String),
    Unauthorized(String),
    Forbidden(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message_error) = match self {
            AppError::NotFound(message) => (
                StatusCode::NOT_FOUND,
                json!({"error": "not_found", "message": message}),
            ),
            AppError::InternalServerError(message) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                json!({"error": "internal_server_error", "message": message}),
            ),
            AppError::Unauthorized(message) => (
                StatusCode::UNAUTHORIZED,
                json!({"error": "unauthorized", "message": message}),
            ),
            AppError::Forbidden(message) => (
                StatusCode::FORBIDDEN,
                json!({"error": "forbidden", "message": message}),
            ),
            AppError::BadRequest(message) => (
                StatusCode::BAD_REQUEST,
                json!({"error": "bad_request", "message": message}),
            ),
        };
        (status, Json(message_error)).into_response()
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        match err {
            sqlx::Error::RowNotFound => AppError::NotFound("Recurso no encontrado".to_string()),
            // Detectar errores de restricción única (código 23505 en PostgreSQL)
            sqlx::Error::Database(db_err) => {
                let error_code = db_err.code();
                if let Some(code) = error_code {
                    // PostgreSQL unique_violation error code
                    if code == "23505" {
                        let message = db_err.message();
                        // El mensaje de PostgreSQL incluye el nombre del constraint
                        // Intentamos parsear para dar un mensaje más específico
                        if message.contains("email") {
                            return AppError::BadRequest("El email ya está registrado".to_string());
                        } else if message.contains("username") {
                            return AppError::BadRequest("El username ya está en uso".to_string());
                        }
                        return AppError::BadRequest("El email o username ya existe".to_string());
                    }
                }
                AppError::InternalServerError(db_err.to_string())
            }
            _ => AppError::InternalServerError(err.to_string()),
        }
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::InternalServerError(format!("JSON error: {}", err))
    }
}

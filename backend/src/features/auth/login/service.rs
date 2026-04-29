use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    features::auth::login::{request::LoginRequest, response::UserResponse},
    shared::{
        errors::AppError,
        helpers::{jwt::encode_jwt, password::verify_password},
        state::AppState,
    },
};

#[derive(Serialize, Deserialize, Clone)]
pub struct Claim {
    pub sub: Uuid, // email del usuario
    pub exp: usize,
    pub iat: usize,
}

// este es el struct que nos devolvera el login_user()
pub struct LoginResult {
    pub access_token: String,
    pub refresh_token: String,
    pub user: UserResponse,
}

pub struct LoginService;

impl LoginService {
    pub async fn login_user(state: &AppState, payload: LoginRequest) -> Result<LoginResult, AppError> {
        // Query simple sin role para evitar errores
        let record = sqlx::query!(
            r#"
            SELECT 
                u.id,
                u.name,
                u.email,
                u.role,
                u.created_at,
                a.password
            FROM account a
            JOIN users u ON u.id = a.user_id
            WHERE a.account_id = $1
            AND a.provider_id = 'credentials'
            "#,
            payload.email
        )
        .fetch_optional(&state.db)
        .await?;

        let record = match record {
            Some(r) => r,
            None => return Err(AppError::Unauthorized("Invalid email or password".into())),
        };

        // Verificar password
        let is_valid =
            verify_password(&payload.password, record.password.as_deref().unwrap_or(""))?;

        if !is_valid {
            return Err(AppError::Unauthorized("Invalid email or password".into()));
        }

        // Obtener el role real del usuario
        let role = record.role;

        // Generar JWT
        let access_token: String = encode_jwt(record.id)?;
        let refresh_token: String = Uuid::new_v4().to_string();

        // Guardar sesión
        sqlx::query!(
            r#"
            INSERT INTO session (
                id,
                token,
                expires_at,
                created_at,
                updated_at,
                user_id
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
            Uuid::new_v4(),
            refresh_token,
            Utc::now() + Duration::days(7),
            Utc::now(),
            Utc::now(),
            record.id
        )
        .execute(&state.db)
        .await?;

        let response: LoginResult = LoginResult {
            access_token: access_token,
            refresh_token: refresh_token,
            user: UserResponse {
                id: record.id,
                name: record.name,
                email: record.email,
                role: Some(role),
                created_at: Some(record.created_at),
            },
        };

        Ok(response)
    }
}

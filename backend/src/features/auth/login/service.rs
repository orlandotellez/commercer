use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    features::auth::login::{request::LoginRequest, response::UserResponse},
    shared::{
        errors::AppError,
        helpers::{jwt::encode_jwt, password::verify_password},
        state::DbState,
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
    pub async fn login_user(db: &DbState, payload: LoginRequest) -> Result<LoginResult, AppError> {
        let record = sqlx::query!(
            r#"
            SELECT 
                u.id,
                u.name,
                u.email,
                u.created_at,
                a.password
            FROM account a
            JOIN users u ON u.id = a.user_id
            WHERE a.account_id = $1
            AND a.provider_id = 'credentials'
            "#,
            payload.email
        )
        .fetch_optional(db)
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
            Utc::now() + Duration::days(7), // duración de 7 días
            Utc::now(),
            Utc::now(),
            record.id
        )
        .execute(db)
        .await?;

        let response: LoginResult = LoginResult {
            access_token: access_token,
            refresh_token: refresh_token,
            user: UserResponse {
                id: record.id,
                name: record.name,
                email: record.email,
                created_at: record.created_at,
            },
        };

        Ok(response)
    }
}

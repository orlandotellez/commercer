use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    features::auth::login::{
        request::LoginRequest,
        response::{LoginResponse, UserResponse},
    },
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

pub struct LoginService;

impl LoginService {
    pub async fn login_user(
        db: &DbState,
        payload: LoginRequest,
    ) -> Result<LoginResponse, AppError> {
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
        let token: String = encode_jwt(record.id)?;

        let response: LoginResponse = LoginResponse {
            access_token: token,
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

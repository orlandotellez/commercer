use chrono::{Duration, Utc};
use uuid::Uuid;

use crate::shared::{errors::AppError, helpers::jwt::encode_jwt, state::DbState};

pub struct RefreshResult {
    pub access_token: String,
    pub refresh_token: String,
    pub user_id: Uuid,
}

pub struct RefreshService;

impl RefreshService {
    pub async fn refresh(db: &DbState, refresh_token: String) -> Result<RefreshResult, AppError> {
        // Buscar sesión
        let session = sqlx::query!(
            r#"
            SELECT user_id, expires_at
            FROM session
            WHERE token = $1
            "#,
            refresh_token
        )
        .fetch_optional(db)
        .await?;

        let session = match session {
            Some(s) => s,
            None => return Err(AppError::Unauthorized("Invalid session".into())),
        };

        // Verificar expiración
        if session.expires_at < Utc::now() {
            return Err(AppError::Unauthorized("Session expired".into()));
        }

        //  Generar nuevo access_token
        let new_access_token: String = encode_jwt(session.user_id)?;

        // Rotar refresh_token
        let new_refresh_token: String = Uuid::new_v4().to_string();

        // eliminar refresh_token viejo
        sqlx::query!(
            r#"
            DELETE FROM session
            WHERE token = $1
            "#,
            refresh_token
        )
        .execute(db)
        .await?;

        // crear nueva sesión
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
            new_refresh_token,
            Utc::now() + Duration::days(7),
            Utc::now(),
            Utc::now(),
            session.user_id
        )
        .execute(db)
        .await?;

        Ok(RefreshResult {
            access_token: new_access_token,
            refresh_token: new_refresh_token,
            user_id: session.user_id,
        })
    }
}

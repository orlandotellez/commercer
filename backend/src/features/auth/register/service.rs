use chrono::Utc;
use uuid::Uuid;

use crate::{
    features::auth::register::request::RegisterRequest,
    shared::{
        errors::AppError, helpers::password::hash_password, state::DbState,
    },
};

pub struct RegisterService;

impl RegisterService {
    pub async fn register_user(db: &DbState, payload: RegisterRequest) -> Result<(), AppError> {
        let hashed_password: String = hash_password(&payload.password)?;

        // Rol por defecto
        let role = if payload.role.is_empty() {
            "customer".to_string()
        } else {
            payload.role
        };
        
        // Validar rol
        if !["admin", "staff", "customer"].contains(&role.as_str()) {
            return Err(AppError::BadRequest("Invalid role".into()));
        }

        // iniciamos una transaccion para poder crear el usuario solo si se crea el account(si el
        // account falla no se crea el usuario)
        let mut tx = db.begin().await?;

        // crear el usuario
        let user = sqlx::query!(
            r#"
                INSERT INTO users (
                    id,
                    name,
                    email,
                    email_verified,
                    role,
                    created_at,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            "#,
            Uuid::new_v4(),
            payload.name,
            payload.email,
            false,
            role,
            Utc::now(),
            Utc::now()
        )
        .fetch_one(&mut *tx)
        .await?;

        // crear el account(si falla no se crea el usuario)
        sqlx::query!(
            r#"
            INSERT INTO account (
                id,
                account_id,
                provider_id,
                user_id,
                password,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            "#,
            Uuid::new_v4(),
            payload.email,
            "credentials",
            user.id,
            hashed_password,
            Utc::now(),
            Utc::now()
        )
        .execute(&mut *tx)
        .await?;

        // confirmar transaccion(crear usuario y account)
        tx.commit().await?;

        Ok(())
    }
}

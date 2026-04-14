use chrono::Utc;
use uuid::Uuid;

use crate::{
    features::auth::register::request::RegisterRequest,
    shared::{
        errors::AppError, helpers::password::hash_password, models::user_model::User,
        state::DbState,
    },
};

pub struct RegisterService;

impl RegisterService {
    pub async fn register_user(db: &DbState, payload: RegisterRequest) -> Result<User, AppError> {
        let hashed_password: String = hash_password(&payload.password)?;

        // iniciamos una transaccion para poder crear el usuario solo si se crea el account(si el
        // account falla no se crea el usuario)
        let mut tx = db.begin().await?;

        // crear el usuario
        let user: User = sqlx::query_as!(
            User,
            r#"
                INSERT INTO users (
                    id,
                    name,
                    email,
                    email_verified,
                    image,
                    role,
                    created_at,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING 
                    id,
                    name,
                    email,
                    email_verified,
                    image,
                    role,
                    created_at,
                    updated_at
            "#,
            Uuid::new_v4(),
            payload.name,
            payload.email,
            false,
            Option::<String>::None,
            payload.role,
            Utc::now(),
            Utc::now()
        )
        .fetch_one(db)
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
            user.email,
            "credentials", // por default será "credentials", más adelante sepuede poner otro provider_id como "google", "github"... etc
            user.id,
            hashed_password,
            Utc::now(),
            Utc::now()
        )
        .execute(&mut *tx)
        .await?;

        // confirmar transaccion(crear usuario y account)
        tx.commit().await?;

        Ok(user)
    }
}

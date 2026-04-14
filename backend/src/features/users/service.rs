use chrono::Utc;
use uuid::Uuid;

use crate::{
    features::users::{
        request::CreateUserRequest, request::UpdateUserRequest, response::UserResponse,
    },
    shared::{errors::AppError, helpers::password::hash_password, state::DbState},
};

#[derive(Debug, Clone, serde::Deserialize)]
pub struct ListUsersParams {
    pub search: Option<String>,
    pub role: Option<String>,
    pub page: Option<usize>,
    pub limit: Option<usize>,
}

impl Default for ListUsersParams {
    fn default() -> Self {
        Self {
            search: None,
            role: None,
            page: Some(1),
            limit: Some(10),
        }
    }
}

pub struct UsersService;

impl UsersService {
    pub async fn list_users(
        db: &DbState,
        params: ListUsersParams,
    ) -> Result<Vec<UserResponse>, AppError> {
        let page = params.page.unwrap_or(1);
        let limit = params.limit.unwrap_or(10);
        let offset = (page - 1) * limit;

        let users = sqlx::query!(
            r#"
            SELECT 
                id::text as id,
                name,
                email,
                email_verified,
                COALESCE(role, 'customer') as role,
                created_at::text as created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            "#,
            limit as i64,
            offset as i64
        )
        .fetch_all(db)
        .await?;

        Ok(users
            .into_iter()
            .map(|u| UserResponse {
                id: u.id.unwrap_or_default(),
                name: u.name,
                email: u.email,
                role: Some(u.role.unwrap_or_else(|| "customer".to_string())),
                email_verified: u.email_verified,
                created_at: u.created_at,
            })
            .collect())
    }

    pub async fn get_user(db: &DbState, id: Uuid) -> Result<UserResponse, AppError> {
        let user = sqlx::query!(
            r#"
            SELECT 
                id::text as id,
                name,
                email,
                email_verified,
                COALESCE(role, 'customer') as role,
                created_at::text as created_at
            FROM users
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(db)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        Ok(UserResponse {
            id: user.id.unwrap_or_default(),
            name: user.name,
            email: user.email,
            role: Some(user.role.unwrap_or_else(|| "customer".to_string())),
            email_verified: user.email_verified,
            created_at: user.created_at,
        })
    }

    pub async fn create_user(
        db: &DbState,
        payload: CreateUserRequest,
    ) -> Result<UserResponse, AppError> {
        let hashed_password = hash_password(&payload.password)?;
        let role = payload.role.unwrap_or_else(|| "customer".to_string());

        if !["admin", "staff", "customer"].contains(&role.as_str()) {
            return Err(AppError::BadRequest("Invalid role".into()));
        }

        let mut tx = db.begin().await?;

        let user = sqlx::query!(
            r#"
            INSERT INTO users (id, name, email, email_verified, role, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id::text as id, name, email, email_verified, role, created_at::text as created_at
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

        // Guardar valores antes de mover
        let user_id = user.id.clone();
        let user_email = user.email.clone();
        let user_role = user.role.clone();
        let user_name = user.name.clone();
        let user_email_verified = user.email_verified;
        let user_created_at = user.created_at.clone();

        // Extraer el ID para usar dos veces
        let user_id_str = user_id.clone().unwrap_or_default();
        let user_id_uuid = Uuid::parse_str(&user_id_str).unwrap_or_default();

        sqlx::query!(
            r#"
            INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            "#,
            Uuid::new_v4(),
            user_email,
            "credentials",
            user_id_uuid,
            hashed_password,
            Utc::now(),
            Utc::now()
        )
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        Ok(UserResponse {
            id: user_id_str,
            name: user_name,
            email: user_email,
            role: Some(user_role),
            email_verified: user_email_verified,
            created_at: user_created_at,
        })
    }

    pub async fn update_user(
        db: &DbState,
        id: Uuid,
        payload: UpdateUserRequest,
    ) -> Result<UserResponse, AppError> {
        let existing = sqlx::query!(
            r#"
            SELECT name, email, COALESCE(role, 'customer') as role FROM users WHERE id = $1
            "#,
            id
        )
        .fetch_optional(db)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        let new_name = payload.name.unwrap_or(existing.name);
        let new_email = payload.email.unwrap_or(existing.email);
        let new_role = payload
            .role
            .unwrap_or(existing.role.unwrap_or_else(|| "customer".to_string()));

        if !["admin", "staff", "customer"].contains(&new_role.as_str()) {
            return Err(AppError::BadRequest("Invalid role".into()));
        }

        let user = sqlx::query!(
            r#"
            UPDATE users 
            SET name = $1, email = $2, role = $3, updated_at = $4
            WHERE id = $5
            RETURNING id::text as id, name, email, email_verified, role, created_at::text as created_at
            "#,
            new_name,
            new_email,
            new_role,
            Utc::now(),
            id
        )
        .fetch_one(db)
        .await?;

        if let Some(password) = payload.password {
            let hashed = hash_password(&password)?;
            sqlx::query!(
                r#"
                UPDATE account 
                SET password = $1, updated_at = $2
                WHERE user_id = $3 AND provider_id = 'credentials'
                "#,
                hashed,
                Utc::now(),
                id
            )
            .execute(db)
            .await?;
        }

        Ok(UserResponse {
            id: user.id.unwrap_or_default(),
            name: user.name,
            email: user.email,
            role: Some(user.role),
            email_verified: user.email_verified,
            created_at: user.created_at,
        })
    }

    pub async fn delete_user(db: &DbState, id: Uuid) -> Result<(), AppError> {
        sqlx::query!(
            r#"
            SELECT id FROM users WHERE id = $1
            "#,
            id
        )
        .fetch_optional(db)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        sqlx::query!(
            r#"
            DELETE FROM users WHERE id = $1
            "#,
            id
        )
        .execute(db)
        .await?;

        Ok(())
    }
}

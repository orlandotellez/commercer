use uuid::Uuid;

use crate::{
    features::categories::{request::*, response::*},
    shared::{errors::AppError, state::AppState},
};

pub struct CategoriesService;

impl CategoriesService {
    /// List all categories
    pub async fn list_categories(state: &AppState) -> Result<Vec<CategoryResponse>, AppError> {
        let categories = sqlx::query!(
            r#"
            SELECT 
                id::text as "id", 
                name, 
                slug, 
                description
            FROM category
            ORDER BY name ASC
            "#
        )
        .fetch_all(&state.db)
        .await?;

        Ok(categories
            .into_iter()
            .map(|c| CategoryResponse {
                id: c.id.unwrap_or_default(),
                name: c.name,
                slug: c.slug.unwrap_or_default(),
                description: c.description,
            })
            .collect())
    }

    /// Get a single category by ID
    pub async fn get_category(state: &AppState, id: Uuid) -> Result<CategoryResponse, AppError> {
        let category = sqlx::query!(
            r#"
            SELECT 
                id::text as "id", 
                name, 
                slug, 
                description
            FROM category
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Category not found".into()))?;

        Ok(CategoryResponse {
            id: category.id.unwrap_or_default(),
            name: category.name,
            slug: category.slug.unwrap_or_default(),
            description: category.description,
        })
    }

    /// Create a new category
    pub async fn create_category(
        state: &AppState,
        payload: CreateCategoryRequest,
    ) -> Result<CategoryResponse, AppError> {
        let id = Uuid::new_v4();

        let result = sqlx::query!(
            r#"
            INSERT INTO category (id, name, slug, description)
            VALUES ($1, $2, $3, $4)
            RETURNING 
                id::text as "id", 
                name, 
                slug, 
                description
            "#,
            id,
            payload.name,
            payload.slug,
            payload.description
        )
        .fetch_one(&state.db)
        .await?;

        Ok(CategoryResponse {
            id: result.id.unwrap_or_default(),
            name: result.name,
            slug: result.slug.unwrap_or_default(),
            description: result.description,
        })
    }

    /// Update an existing category
    pub async fn update_category(
        state: &AppState,
        id: Uuid,
        payload: UpdateCategoryRequest,
    ) -> Result<CategoryResponse, AppError> {
        let result = sqlx::query!(
            r#"
            UPDATE category SET
                name = COALESCE($1, name),
                slug = COALESCE($2, slug),
                description = COALESCE($3, description)
            WHERE id = $4
            RETURNING 
                id::text as "id", 
                name, 
                slug, 
                description
            "#,
            payload.name,
            payload.slug,
            payload.description,
            id
        )
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Category not found".into()))?;

        Ok(CategoryResponse {
            id: result.id.unwrap_or_default(),
            name: result.name,
            slug: result.slug.unwrap_or_default(),
            description: result.description,
        })
    }

    /// Delete a category
    pub async fn delete_category(state: &AppState, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query!("DELETE FROM category WHERE id = $1", id)
            .execute(&state.db)
            .await?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Category not found".into()));
        }

        Ok(())
    }
}

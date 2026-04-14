use bigdecimal::BigDecimal;
use std::str::FromStr;
use uuid::Uuid;

use crate::{
    features::products::{request::*, response::*},
    shared::{errors::AppError, state::DbState},
};

#[derive(Debug, Clone, serde::Deserialize, Default)]
pub struct ListProductsParams {
    pub search: Option<String>,
    pub category_id: Option<String>,
    pub featured: Option<bool>,
    pub active: Option<bool>,
    #[serde(default = "default_page")]
    pub page: Option<usize>,
    #[serde(default = "default_limit")]
    pub limit: Option<usize>,
}

fn default_page() -> Option<usize> {
    Some(1)
}

fn default_limit() -> Option<usize> {
    Some(10)
}

pub struct ProductsService;

impl ProductsService {
    /// List products with optional filters.
    pub async fn list_products(
        db: &DbState,
        params: ListProductsParams,
    ) -> Result<Vec<ProductResponse>, AppError> {
        let page = params.page.unwrap_or(1);
        let limit = params.limit.unwrap_or(10);
        let offset = (page - 1) * limit;

        let products = sqlx::query!(
            r#"
            SELECT 
                id::text as "id", 
                name, 
                slug, 
                description, 
                price as "price", 
                COALESCE(original_price, 0.0) as "original_price: Option<f32>", 
                image_url as "image", 
                category_id::text as "category_id", 
                brand, 
                stock as "stock", 
                specs, 
                COALESCE(active, false) as "active", 
                COALESCE(featured, false) as "featured", 
                created_at::text as "created_at"
            FROM product
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            "#,
            limit as i64,
            offset as i64
        )
        .fetch_all(db)
        .await?;

        Ok(products
            .into_iter()
            .map(|p| ProductResponse {
                id: p.id.unwrap_or_default(),
                name: p.name,
                slug: p.slug,
                description: p.description,
                price: p.price,
                original_price: p.original_price.flatten().map(|v| v as f32),
                image: p.image,
                category_id: p.category_id,
                brand: p.brand,
                stock: p.stock,
                specs: p.specs,
                active: p.active.unwrap_or(false),
                featured: p.featured.unwrap_or(false),
                created_at: p.created_at,
            })
            .collect())
    }

    /// Get a single product by ID
    pub async fn get_product(db: &DbState, id: Uuid) -> Result<ProductResponse, AppError> {
        let product = sqlx::query!(
            r#"
            SELECT 
                id::text as "id", 
                name, 
                slug, 
                description, 
                price as "price", 
                COALESCE(original_price, 0.0) as "original_price: Option<f32>", 
                image_url as "image", 
                category_id::text as "category_id", 
                brand, 
                stock as "stock", 
                specs, 
                COALESCE(active, false) as "active", 
                COALESCE(featured, false) as "featured", 
                created_at::text as "created_at"
            FROM product
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(db)
        .await?
        .ok_or_else(|| AppError::NotFound("Product not found".into()))?;

        Ok(ProductResponse {
            id: product.id.unwrap_or_default(),
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            original_price: product.original_price.flatten().map(|v| v as f32),
            image: product.image,
            category_id: product.category_id,
            brand: product.brand,
            stock: product.stock,
            specs: product.specs,
            active: product.active.unwrap_or(false),
            featured: product.featured.unwrap_or(false),
            created_at: product.created_at,
        })
    }

    /// Create a new product
    pub async fn create_product(
        db: &DbState,
        payload: CreateProductRequest,
    ) -> Result<ProductResponse, AppError> {
        let id = Uuid::new_v4();
        let category_id: Option<Uuid> = payload.category_id.and_then(|c| Uuid::parse_str(&c).ok());

        let result = sqlx::query!(
            r#"
            INSERT INTO product (
                id, name, slug, description, price, original_price, 
                image_url, category_id, brand, stock, specs, active, featured
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
            )
            RETURNING 
                id::text as "id", 
                name, 
                slug, 
                description, 
                price as "price", 
                original_price as "original_price: Option<f32>", 
                image_url as "image", 
                category_id::text as "category_id", 
                brand, 
                stock as "stock", 
                specs, 
                active, 
                featured, 
                created_at::text as "created_at"
            "#,
            id,
            payload.name,
            payload.slug,
            payload.description,
            payload.price,
            payload
                .original_price
                .map(|v| BigDecimal::from_str(&v.to_string()).unwrap()),
            payload.image,
            category_id,
            payload.brand,
            payload.stock,
            payload.specs,
            payload.active.unwrap_or(true),
            payload.featured.unwrap_or(false)
        )
        .fetch_one(db)
        .await?;

        Ok(ProductResponse {
            id: result.id.unwrap_or_default(),
            name: result.name,
            slug: result.slug,
            description: result.description,
            price: result.price,
            original_price: result.original_price.flatten().map(|v| v as f32),
            image: result.image,
            category_id: result.category_id,
            brand: result.brand,
            stock: result.stock,
            specs: result.specs,
            active: result.active.unwrap_or(false),
            featured: result.featured.unwrap_or(false),
            created_at: result.created_at,
        })
    }

    /// Update an existing product
    pub async fn update_product(
        db: &DbState,
        id: Uuid,
        payload: UpdateProductRequest,
    ) -> Result<ProductResponse, AppError> {
        let category_id: Option<Uuid> = payload.category_id.and_then(|c| Uuid::parse_str(&c).ok());

        let result = sqlx::query!(
            r#"
            UPDATE product SET
                name = COALESCE($1, name),
                slug = COALESCE($2, slug),
                description = COALESCE($3, description),
                price = COALESCE($4, price),
                original_price = $5,
                image_url = COALESCE($6, image_url),
                category_id = $7,
                brand = COALESCE($8, brand),
                stock = COALESCE($9, stock),
                specs = COALESCE($10, specs),
                active = COALESCE($11, active),
                featured = COALESCE($12, featured),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $13
            RETURNING 
                id::text as "id", 
                name, 
                slug, 
                description, 
                price as "price", 
                original_price as "original_price: Option<f32>", 
                image_url as "image", 
                category_id::text as "category_id", 
                brand, 
                stock as "stock", 
                specs, 
                active, 
                featured, 
                created_at::text as "created_at"
            "#,
            payload.name,
            payload.slug,
            payload.description,
            payload.price,
            payload
                .original_price
                .map(|v| BigDecimal::from_str(&v.to_string()).unwrap()),
            payload.image,
            category_id,
            payload.brand,
            payload.stock,
            payload.specs,
            payload.active,
            payload.featured,
            id
        )
        .fetch_optional(db)
        .await?
        .ok_or_else(|| AppError::NotFound("Product not found".into()))?;

        Ok(ProductResponse {
            id: result.id.unwrap_or_default(),
            name: result.name,
            slug: result.slug,
            description: result.description,
            price: result.price,
            original_price: result.original_price.flatten().map(|v| v as f32),
            image: result.image,
            category_id: result.category_id,
            brand: result.brand,
            stock: result.stock,
            specs: result.specs,
            active: result.active.unwrap_or(false),
            featured: result.featured.unwrap_or(false),
            created_at: result.created_at,
        })
    }

    /// Delete a product
    pub async fn delete_product(db: &DbState, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query!("DELETE FROM product WHERE id = $1", id)
            .execute(db)
            .await?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("Product not found".into()));
        }

        Ok(())
    }
}

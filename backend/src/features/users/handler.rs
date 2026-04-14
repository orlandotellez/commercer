use axum::{
    extract::{Path, Query, State},
    response::Json,
};

use crate::features::users::service::{ListUsersParams, UsersService};
use crate::shared::{errors::AppError, state::DbState};

pub async fn list_users(
    State(db): State<DbState>,
    Query(params): Query<ListUsersParams>,
) -> Result<Json<Vec<super::response::UserResponse>>, AppError> {
    let users = UsersService::list_users(&db, params).await?;
    Ok(Json(users))
}

pub async fn get_user(
    State(db): State<DbState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<super::response::UserResponse>, AppError> {
    let user = UsersService::get_user(&db, id).await?;
    Ok(Json(user))
}

pub async fn create_user(
    State(db): State<DbState>,
    Json(payload): Json<super::request::CreateUserRequest>,
) -> Result<Json<super::response::UserResponse>, AppError> {
    let user = UsersService::create_user(&db, payload).await?;
    Ok(Json(user))
}

pub async fn update_user(
    State(db): State<DbState>,
    Path(id): Path<uuid::Uuid>,
    Json(payload): Json<super::request::UpdateUserRequest>,
) -> Result<Json<super::response::UserResponse>, AppError> {
    let user = UsersService::update_user(&db, id, payload).await?;
    Ok(Json(user))
}

pub async fn delete_user(
    State(db): State<DbState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<super::response::DeleteResponse>, AppError> {
    UsersService::delete_user(&db, id).await?;
    Ok(Json(super::response::DeleteResponse { success: true }))
}


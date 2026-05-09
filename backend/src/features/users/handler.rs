use axum::{
    extract::{Path, Query, State},
    response::Json,
};
use axum_extra::{
    TypedHeader,
    headers::{Authorization, authorization::Bearer},
};

use crate::features::users::service::{ListUsersParams, UsersService};
use crate::shared::{errors::AppError, helpers::jwt::decode_jwt, state::AppState};

pub async fn get_current_user(
    State(state): State<AppState>,
    TypedHeader(authorization): TypedHeader<Authorization<Bearer>>,
) -> Result<Json<super::response::UserResponse>, AppError> {
    // Extract token from Authorization header
    let token = authorization.token();

    // Decode JWT to get user_id
    let claims = decode_jwt(token)?;
    let user_id = claims.sub;

    // Fetch user from database
    let user = UsersService::get_user_by_id(&state, user_id).await?;

    Ok(Json(user))
}

pub async fn list_users(
    State(state): State<AppState>,
    Query(params): Query<ListUsersParams>,
) -> Result<Json<Vec<super::response::UserResponse>>, AppError> {
    let users = UsersService::list_users(&state, params).await?;
    Ok(Json(users))
}

pub async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<super::response::UserResponse>, AppError> {
    let user = UsersService::get_user(&state, id).await?;
    Ok(Json(user))
}

pub async fn create_user(
    State(state): State<AppState>,
    Json(payload): Json<super::request::CreateUserRequest>,
) -> Result<Json<super::response::UserResponse>, AppError> {
    let user = UsersService::create_user(&state, payload).await?;
    Ok(Json(user))
}

pub async fn update_user(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
    Json(payload): Json<super::request::UpdateUserRequest>,
) -> Result<Json<super::response::UserResponse>, AppError> {
    let user = UsersService::update_user(&state, id, payload).await?;
    Ok(Json(user))
}

pub async fn delete_user(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
) -> Result<Json<super::response::DeleteResponse>, AppError> {
    UsersService::delete_user(&state, id).await?;
    Ok(Json(super::response::DeleteResponse { success: true }))
}

pub async fn change_password(
    State(state): State<AppState>,
    Path(id): Path<uuid::Uuid>,
    Json(payload): Json<super::request::ChangePasswordRequest>,
) -> Result<Json<super::response::DeleteResponse>, AppError> {
    UsersService::change_password(&state, id, payload).await?;
    Ok(Json(super::response::DeleteResponse { success: true }))
}

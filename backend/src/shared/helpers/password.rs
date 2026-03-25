use bcrypt::{DEFAULT_COST, hash, verify};

use crate::shared::errors::AppError;

pub fn hash_password(password: &str) -> Result<String, AppError> {
    hash(password, DEFAULT_COST)
        .map_err(|e| AppError::InternalServerError(format!("Error hasheando password: {}", e)))
}

pub fn verify_password(password: &str, hash: &str) -> Result<bool, AppError> {
    verify(password, hash)
        .map_err(|e| AppError::InternalServerError(format!("Error verificando password: {}", e)))
}

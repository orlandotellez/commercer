use chrono::{Duration, Utc};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, TokenData, Validation, decode, encode};
use uuid::Uuid;

use crate::{
    features::auth::login::service::Claim,
    shared::{config::constants::JWT_SECRET, errors::AppError},
};

pub fn encode_jwt(id: Uuid) -> Result<String, AppError> {
    let expiration: i64 = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .expect("Timestamp válido")
        .timestamp();

    let claims: Claim = Claim {
        sub: id,
        exp: expiration as usize,
        iat: Utc::now().timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(JWT_SECRET.as_bytes()),
    )
    .map_err(|_| AppError::InternalServerError("Error codificando JWT".to_string()))
}

pub fn decode_jwt(token: &str) -> Result<Claim, AppError> {
    let validation: Validation = Validation::default();

    let token_data: TokenData<Claim> = decode::<Claim>(
        token,
        &DecodingKey::from_secret(JWT_SECRET.as_bytes()),
        &validation,
    )
    .map_err(|_| AppError::Unauthorized("Token inválido o expirado".to_string()))?;

    Ok(token_data.claims)
}

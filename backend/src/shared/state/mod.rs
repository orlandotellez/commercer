use sqlx::PgPool;
use std::marker::Send;
use std::marker::Sync;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
}

unsafe impl Send for AppState {}
unsafe impl Sync for AppState {}

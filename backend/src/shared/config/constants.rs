use std::env;

use once_cell::sync::Lazy;

pub static FRONTEND_URL: Lazy<String> =
    Lazy::new(|| env::var("FRONTEND_URL").expect("DATABASE_URL not be defined"));

pub static DATABASE_URL: Lazy<String> =
    Lazy::new(|| env::var("DATABASE_URL").expect("DATABASE_URL not be defined"));

pub static JWT_SECRET: Lazy<String> =
    Lazy::new(|| env::var("JWT_SECRET").expect("JWT_SECRET not be defined"));

pub static RESEND_API_KEY: Lazy<String> =
    Lazy::new(|| env::var("RESEND_API_KEY").expect("RESEND_API_KEY not be defined"));

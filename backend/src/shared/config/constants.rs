use std::env;

use once_cell::sync::Lazy;

pub static FRONTEND_URL: Lazy<String> =
    Lazy::new(|| env::var("FRONTEND_URL").expect("FRONTEND_URL not be defined"));

pub static DATABASE_URL: Lazy<String> =
    Lazy::new(|| env::var("DATABASE_URL").expect("DATABASE_URL not be defined"));

// JWT_SECRET with fallback for testing
pub static JWT_SECRET: Lazy<String> = Lazy::new(|| {
    env::var("JWT_SECRET").unwrap_or_else(|_| {
        // For testing only - in production this should always be set
        "test_secret_default_for_testing_only_change_in_production".to_string()
    })
});

pub static RESEND_API_KEY: Lazy<String> =
    Lazy::new(|| env::var("RESEND_API_KEY").unwrap_or_else(|_| "test_resend_key".to_string()));

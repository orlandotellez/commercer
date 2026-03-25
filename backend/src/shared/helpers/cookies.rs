use axum_extra::extract::cookie::{Cookie, SameSite};
use time::Duration;

pub fn build_session_cookie(token: String) -> Cookie<'static> {
    Cookie::build(("refresh_token", token))
        .http_only(true) // no accesible desde JS
        .secure(true) // solo HTTPS (cambiar en dev)
        .same_site(SameSite::Lax) // protección CSRF básica
        .path("/") // disponible en toda la app
        .max_age(Duration::hours(24)) // 24 horas
        .build()
}

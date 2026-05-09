/// Format date for display (local timezone)
pub fn format_date(date_str: &str) -> String {
    // Parse the ISO timestamp and format to local date
    if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(date_str) {
        dt.format("%d/%m/%Y %H:%M").to_string()
    } else if let Ok(naive) =
        chrono::NaiveDateTime::parse_from_str(date_str, "%Y-%m-%d %H:%M:%S%.f%z")
    {
        naive.format("%d/%m/%Y %H:%M").to_string()
    } else {
        // Fallback: try to extract just the date part
        date_str.split('T').next().unwrap_or(date_str).to_string()
    }
}

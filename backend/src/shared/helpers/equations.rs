/// Calculate percentage change between current and previous values
pub fn calculate_change(current: f64, previous: f64) -> i32 {
    if previous == 0.0 {
        if current == 0.0 { 0 } else { 100 }
    } else {
        (((current - previous) / previous) * 100.0).round() as i32
    }
}

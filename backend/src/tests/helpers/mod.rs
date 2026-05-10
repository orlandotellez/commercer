use sqlx::{PgPool, postgres::PgPoolOptions};
use std::env;
use std::sync::Once;
use uuid::Uuid;

/// This must be called BEFORE any server code that uses Lazy statics is loaded
static INIT_TEST_ENV: Once = Once::new();
pub fn init_test_env() {
    INIT_TEST_ENV.call_once(|| {
        // Set test JWT_SECRET if not already set - Required for server to start
        // Note: Must be set before any Lazy static is evaluated
        if env::var("JWT_SECRET").is_err() {
            // We can't modify env at runtime reliably with Lazy statics
            // Tests should be run with: JWT_SECRET=test_secret cargo test
            eprintln!(
                "WARNING: JWT_SECRET not set. Run tests with: JWT_SECRET=test_secret cargo test"
            );
        }
    });
}

/// Creates a fresh test database for each test run.
pub async fn create_test_pool() -> Result<PgPool, sqlx::Error> {
    init_test_env();
    // Use UUID without dashes to avoid PostgreSQL syntax issues
    let uuid_str = Uuid::new_v4().to_string().replace("-", "");
    let test_db_name = format!("test_{}", uuid_str);

    // Get the main database URL and extract connection details
    let main_url = env::var("TEST_DATABASE_URL")
        .or_else(|_| env::var("DATABASE_URL"))
        .unwrap_or_else(|_| {
            "postgres://dev-espada:espadaPOSTGRES@localhost:5432/techcomponents_db".to_string()
        });

    // Parse the main URL to get host, port, user, password
    let (host, port, user, password) = parse_postgres_url(&main_url);

    // Connect to default postgres database to create a new database
    let admin_url = format!(
        "postgres://{}:{}@{}:{}/postgres",
        user, password, host, port
    );

    let admin_pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&admin_url)
        .await?;

    // Create the test database
    let create_sql = format!("CREATE DATABASE {}", test_db_name);
    sqlx::query(&create_sql).execute(&admin_pool).await?;

    admin_pool.close().await;

    // Now connect to the new test database
    let test_url = format!(
        "postgres://{}:{}@{}:{}/{}",
        user, password, host, port, test_db_name
    );

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&test_url)
        .await?;

    // Run migrations for test database
    run_migrations(&pool).await?;

    Ok(pool)
}

/// Parse PostgreSQL URL to extract connection parameters
fn parse_postgres_url(url: &str) -> (String, String, String, String) {
    // Format: postgres://user:password@host:port/database
    let url = url.trim_start_matches("postgres://");

    let (auth, rest) = url.split_once('@').unwrap_or(("", url));
    let (user, password) = auth.split_once(':').unwrap_or((auth, ""));

    let (host_port, _database) = rest.split_once('/').unwrap_or((rest, ""));
    let (host, port) = host_port.split_once(':').unwrap_or((host_port, "5432"));

    (
        host.to_string(),
        port.to_string(),
        user.to_string(),
        password.to_string(),
    )
}

/// Cleans up the test database (drops it)
pub async fn cleanup_test_data(pool: &PgPool) -> Result<(), sqlx::Error> {
    // Close the pool first - this will release all connections
    pool.close().await;

    // The database will remain but with unique UUID so it won't conflict
    // In a production CI, you'd want to clean up old test databases periodically
    Ok(())
}

/// Simplified cleanup for use in test (doesn't drop, just truncates)
pub async fn truncate_test_data(pool: &PgPool) -> Result<(), sqlx::Error> {
    // Truncate all tables in correct order (using SINGULAR names where needed)
    sqlx::query("TRUNCATE TABLE order_items CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("TRUNCATE TABLE orders CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("TRUNCATE TABLE verification CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("TRUNCATE TABLE session CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("TRUNCATE TABLE account CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("TRUNCATE TABLE product CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("TRUNCATE TABLE category CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("TRUNCATE TABLE users CASCADE")
        .execute(pool)
        .await?;
    Ok(())
}

/// Runs the schema creation for the test database
async fn run_migrations(pool: &PgPool) -> Result<(), sqlx::Error> {
    // Enable UUID extension
    sqlx::query("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
        .execute(pool)
        .await?;

    // Drop existing tables if they exist (to handle retries)
    sqlx::query("DROP TABLE IF EXISTS order_items CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("DROP TABLE IF EXISTS orders CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("DROP TABLE IF EXISTS inventory CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("DROP TABLE IF EXISTS product CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("DROP TABLE IF EXISTS category CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("DROP TABLE IF EXISTS verification CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("DROP TABLE IF EXISTS session CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("DROP TABLE IF EXISTS account CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("DROP TABLE IF EXISTS users CASCADE")
        .execute(pool)
        .await?;

    // Users table
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            email_verified BOOLEAN DEFAULT false,
            role VARCHAR(50) DEFAULT 'customer',
            phone VARCHAR(50),
            image TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Account table (for passwords) - matching production schema
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS account (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            account_id TEXT NOT NULL,
            provider_id TEXT NOT NULL,
            user_id UUID NOT NULL,
            access_token TEXT,
            refresh_token TEXT,
            id_token TEXT,
            access_token_expires_at TIMESTAMP WITH TIME ZONE,
            refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
            scope TEXT,
            password TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Session table (singular!)
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS session (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            token TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            user_agent TEXT,
            user_id UUID NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Category table (singular!)
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS category (
            id UUID PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Product table (singular!) - matching production schema
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS product (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            description TEXT,
            price REAL NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            original_price NUMERIC(10,2),
            image_url TEXT,
            brand TEXT,
            specs JSONB,
            category_id UUID,
            active BOOLEAN DEFAULT true,
            featured BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Inventory table (required for orders)
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS inventory (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            product_id UUID NOT NULL,
            stock_current INTEGER NOT NULL,
            stock_minimum INTEGER NOT NULL,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Orders table (matching production)
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            status TEXT NOT NULL DEFAULT 'pending',
            subtotal NUMERIC(10,2) NOT NULL,
            taxes NUMERIC(10,2) NOT NULL DEFAULT 0,
            total NUMERIC(10,2) NOT NULL,
            user_id UUID,
            customer_name TEXT,
            customer_email TEXT,
            customer_phone TEXT,
            shipping_address TEXT,
            payment_name TEXT,
            is_guest BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Order items table (plural!) - matching production
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS order_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            order_id UUID NOT NULL,
            product_id UUID NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price NUMERIC(10,2) NOT NULL,
            subtotal NUMERIC(10,2) NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await?;

    // Add foreign keys separately
    sqlx::query("ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE")
        .execute(pool)
        .await?;
    sqlx::query("ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE")
        .execute(pool)
        .await?;

    // Verification table (singular!)
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS verification (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL,
            code VARCHAR(10) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        "#,
    )
    .execute(pool)
    .await?;

    Ok(())
}

/// Helper to create a test user directly in the database
pub async fn create_test_user(
    pool: &PgPool,
    name: &str,
    email: &str,
    role: &str,
    password_hash: &str,
) -> Result<uuid::Uuid, sqlx::Error> {
    use uuid::Uuid;

    let user_id = Uuid::new_v4();

    // Insert user
    sqlx::query(
        r#"
        INSERT INTO users (id, name, email, email_verified, role)
        VALUES ($1, $2, $3, $4, $5)
        "#,
    )
    .bind(user_id)
    .bind(name)
    .bind(email)
    .bind(false)
    .bind(role)
    .execute(pool)
    .await?;

    // Insert account - use email as account_id so login can find it
    sqlx::query(
        r#"
        INSERT INTO account (id, account_id, provider_id, user_id, password)
        VALUES ($1, $2, 'credentials', $3, $4)
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(email) // Use email as account_id
    .bind(user_id)
    .bind(password_hash)
    .execute(pool)
    .await?;

    Ok(user_id)
}

/// Helper to create a test category
pub async fn create_test_category(
    pool: &PgPool,
    name: &str,
    slug: &str,
) -> Result<uuid::Uuid, sqlx::Error> {
    use chrono::Utc;
    use uuid::Uuid;

    let category_id = Uuid::new_v4();
    let now = Utc::now();

    sqlx::query(
        r#"
        INSERT INTO category (id, name, slug, description, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        "#,
    )
    .bind(category_id)
    .bind(name)
    .bind(slug)
    .bind(&format!("Description for {}", name))
    .bind(now)
    .bind(now)
    .execute(pool)
    .await?;

    Ok(category_id)
}

/// Helper to create a test product
pub async fn create_test_product(
    pool: &PgPool,
    name: &str,
    slug: &str,
    price: f64,
    category_id: Option<uuid::Uuid>,
) -> Result<uuid::Uuid, sqlx::Error> {
    use serde_json::json;
    use uuid::Uuid;

    let product_id = Uuid::new_v4();
    let specs = json!({});

    sqlx::query(
        r#"
        INSERT INTO product (id, name, slug, description, price, original_price, image_url, category_id, brand, stock, specs, active, featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        "#,
    )
    .bind(product_id)
    .bind(name)
    .bind(slug)
    .bind(&format!("Description for {}", name))
    .bind(price)
    .bind(price * 1.2)
    .bind("https://example.com/image.jpg")
    .bind(category_id)
    .bind("TestBrand")
    .bind(100)
    .bind(&specs)
    .bind(true)
    .bind(false)
    .execute(pool)
    .await?;

    // Also create inventory record (required for orders)
    sqlx::query(
        r#"
        INSERT INTO inventory (id, product_id, stock_current, stock_minimum)
        VALUES ($1, $2, $3, $4)
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(product_id)
    .bind(100) // stock_current
    .bind(10) // stock_minimum
    .execute(pool)
    .await?;

    Ok(product_id)
}


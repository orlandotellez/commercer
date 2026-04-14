CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
  name TEXT NOT NULL, 
  email TEXT NOT NULL UNIQUE, 
  email_verified BOOLEAN NOT NULL, 
  image TEXT, 
  role TEXT NOT NULL DEFAULT 'customer', 
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- session
CREATE TABLE session (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
  expires_at TIMESTAMPTZ NOT NULL, 
  token TEXT NOT NULL UNIQUE, 
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  updated_at TIMESTAMPTZ NOT NULL, 
  ip_address TEXT,
  user_agent TEXT, 
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- account
CREATE TABLE account (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
  account_id TEXT NOT NULL, 
  provider_id TEXT NOT NULL, 
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
  access_token TEXT, 
  refresh_token TEXT, 
  id_token TEXT, 
  access_token_expires_at TIMESTAMPTZ, 
  refresh_token_expires_at TIMESTAMPTZ, 
  scope TEXT, 
  password TEXT, 
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  updated_at TIMESTAMPTZ NOT NULL
);

-- verification
CREATE TABLE verification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
  identifier TEXT NOT NULL, 
  value TEXT NOT NULL, 
  expires_at TIMESTAMPTZ NOT NULL, 
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- category
CREATE TABLE category (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT
);

-- product
CREATE TABLE product (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
  category_id UUID NOT NULL REFERENCES category(id) ON DELETE CASCADE, 
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  active TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

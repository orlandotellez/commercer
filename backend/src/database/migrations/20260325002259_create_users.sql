CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE user (
  id UUID DEFAULT uuid_generate_v4(), 
  name TEXT NOT NULL, 
  email TEXT NOT NULL UNIQUE, 
  email_verified BOOLEAN NOT NULL, 
  image TEXT, 
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  updated_at timestamptz default CURRENT_TIMESTAMP NOT NULL
);

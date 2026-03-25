CREATE TABLE session (
  id UUID DEFAULT uuid_generate_v4(), 
  expires_at TIMESTAMPTZ NOT NULL, 
  token TEXT NOT NULL UNIQUE, 
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL, 
  updated_at TIMESTAMPTZ NOT NULL, 
  ip_address TEXT,
  user_agent TEXT, 
  user_id TEXT NOT NULL REFERENCES user (id) ON DELETE CASCADE
);

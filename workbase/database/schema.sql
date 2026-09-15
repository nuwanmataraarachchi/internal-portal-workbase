CREATE TABLE IF NOT EXISTS announcements (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(120) NOT NULL CHECK (char_length(title) >= 3),
  body TEXT NOT NULL CHECK (char_length(body) >= 1 AND char_length(body) <= 1500),
  author_name VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

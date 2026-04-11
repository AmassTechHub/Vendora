-- Run this in Supabase SQL Editor if invite code generation is failing.
-- It creates the invite_codes table if it doesn't exist, and adds any missing columns.

CREATE TABLE IF NOT EXISTS invite_codes (
    id                  BIGSERIAL PRIMARY KEY,
    code                VARCHAR(32)  NOT NULL UNIQUE,
    role                VARCHAR(20)  NOT NULL,
    expires_at          TIMESTAMP    NOT NULL,
    used                BOOLEAN      NOT NULL DEFAULT FALSE,
    used_by_username    VARCHAR(255),
    used_at             TIMESTAMP,
    created_by_user_id  BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Add missing columns if the table already exists but is missing them (safe to run multiple times)
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS used_by_username   VARCHAR(255);
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS used_at            TIMESTAMP;
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE invite_codes ADD COLUMN IF NOT EXISTS created_at         TIMESTAMP NOT NULL DEFAULT NOW();

-- Verify
SELECT COUNT(*) AS invite_codes_rows FROM invite_codes;

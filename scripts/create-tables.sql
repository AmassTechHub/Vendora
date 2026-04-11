-- Run this ONCE in Supabase SQL Editor to create all tables.
-- Safe to re-run (uses IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS users (
    id                      BIGSERIAL PRIMARY KEY,
    username                VARCHAR(255) NOT NULL UNIQUE,
    password                VARCHAR(255) NOT NULL,
    full_name               VARCHAR(255) NOT NULL,
    role                    VARCHAR(20)  NOT NULL DEFAULT 'CASHIER',
    active                  BOOLEAN      NOT NULL DEFAULT TRUE,
    failed_login_attempts   INT          NOT NULL DEFAULT 0,
    lockout_until           TIMESTAMP,
    password_changed_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_at              TIMESTAMP    NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token       VARCHAR(512) NOT NULL UNIQUE,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMP    NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    contact_person  VARCHAR(255),
    phone           VARCHAR(50),
    email           VARCHAR(255),
    address         TEXT,
    notes           TEXT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id                   BIGSERIAL PRIMARY KEY,
    name                 VARCHAR(255)   NOT NULL,
    category             VARCHAR(100),
    price                NUMERIC(10,2)  NOT NULL,
    quantity             INT            NOT NULL DEFAULT 0,
    barcode              VARCHAR(100),
    supplier             VARCHAR(255),
    low_stock_threshold  INT            NOT NULL DEFAULT 10,
    active               BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    email           VARCHAR(255),
    address         TEXT,
    loyalty_points  INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shifts (
    id                  BIGSERIAL PRIMARY KEY,
    cashier_id          BIGINT        REFERENCES users(id) ON DELETE SET NULL,
    start_time          TIMESTAMP     NOT NULL DEFAULT NOW(),
    end_time            TIMESTAMP,
    opening_cash        NUMERIC(10,2) NOT NULL DEFAULT 0,
    closing_cash        NUMERIC(10,2),
    expected_cash       NUMERIC(10,2),
    variance            NUMERIC(10,2),
    notes               TEXT,
    status              VARCHAR(20)   NOT NULL DEFAULT 'OPEN'
);

CREATE TABLE IF NOT EXISTS sales (
    id                  BIGSERIAL PRIMARY KEY,
    cashier_id          BIGINT        REFERENCES users(id) ON DELETE SET NULL,
    customer_id         BIGINT        REFERENCES customers(id) ON DELETE SET NULL,
    shift_id            BIGINT        REFERENCES shifts(id) ON DELETE SET NULL,
    subtotal            NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount            NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
    amount_paid         NUMERIC(10,2) NOT NULL DEFAULT 0,
    change_amount       NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_method      VARCHAR(20)   NOT NULL DEFAULT 'CASH',
    payment_status      VARCHAR(20)   NOT NULL DEFAULT 'NOT_REQUIRED',
    payment_reference   VARCHAR(255),
    created_at          TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
    id          BIGSERIAL PRIMARY KEY,
    sale_id     BIGINT        NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id  BIGINT        REFERENCES products(id) ON DELETE SET NULL,
    quantity    INT           NOT NULL,
    unit_price  NUMERIC(10,2) NOT NULL,
    subtotal    NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS refunds (
    id              BIGSERIAL PRIMARY KEY,
    sale_id         BIGINT        REFERENCES sales(id) ON DELETE SET NULL,
    cashier_id      BIGINT        REFERENCES users(id) ON DELETE SET NULL,
    reason          TEXT,
    total_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refund_items (
    id          BIGSERIAL PRIMARY KEY,
    refund_id   BIGINT        NOT NULL REFERENCES refunds(id) ON DELETE CASCADE,
    product_id  BIGINT        REFERENCES products(id) ON DELETE SET NULL,
    quantity    INT           NOT NULL,
    unit_price  NUMERIC(10,2) NOT NULL,
    subtotal    NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
    id          BIGSERIAL PRIMARY KEY,
    description VARCHAR(255)  NOT NULL,
    amount      NUMERIC(10,2) NOT NULL,
    category    VARCHAR(100),
    recorded_by BIGINT        REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id           BIGSERIAL PRIMARY KEY,
    username     VARCHAR(255),
    action       VARCHAR(100),
    entity_type  VARCHAR(100),
    entity_id    VARCHAR(255),
    details      TEXT,
    status       VARCHAR(20),
    ip_address   VARCHAR(50),
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Verify
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

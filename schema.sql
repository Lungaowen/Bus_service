-- Run this in the Supabase SQL Editor
CREATE SCHEMA IF NOT EXISTS card_service;

CREATE TABLE IF NOT EXISTS card_service.credit_advances (
    id SERIAL PRIMARY KEY,
    card_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    remaining_amount DECIMAL(18,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    status VARCHAR(20) DEFAULT 'Outstanding',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    repaid_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS card_service.credit_limits (
    id SERIAL PRIMARY KEY,
    card_id INTEGER,
    user_id INTEGER NOT NULL,
    max_advance_amount DECIMAL(18,2) DEFAULT 500,
    currency VARCHAR(3) DEFAULT 'ZAR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_credit_advances_card_id ON card_service.credit_advances(card_id);
CREATE INDEX IF NOT EXISTS ix_credit_advances_user_id ON card_service.credit_advances(user_id);
CREATE INDEX IF NOT EXISTS ix_credit_advances_status ON card_service.credit_advances(status);
CREATE INDEX IF NOT EXISTS ix_credit_limits_user_id ON card_service.credit_limits(user_id);
CREATE INDEX IF NOT EXISTS ix_credit_limits_card_id ON card_service.credit_limits(card_id);

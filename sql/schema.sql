CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    "firstName" VARCHAR(20) NOT NULL,
    "lastName" VARCHAR(20) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    address VARCHAR (255) NOT NULL,
    city VARCHAR(20) NOT NULL,
    state VARCHAR(20) NOT NULL,
    "pinCode" VARCHAR(6) NOT NULL,
    "dateOfBirth" VARCHAR(10) NOT NULL,
    primary_account_id INTEGER,

    CONSTRAINT fk_primary_account
         FOREIGN KEY (primary_account_id)
         REFERENCES accounts(id)
         ON DELETE SET NULL
);

CREATE TABLE sessions(
    id SERIAL PRIMARY KEY,
    session_token TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    expires_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);



CREATE TABLE banks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO banks (name)
VALUES
    ('State Bank of India'),
    ('HDFC Bank'),
    ('ICICI Bank'),
    ('Union Bank of India'),
    ('Axis Bank'),
    ('Punjab National Bank'),
    ('Bank of India');



CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    bank_id INTEGER NOT NULL
        REFERENCES banks(id),

    account_number VARCHAR(16) UNIQUE NOT NULL,

    balance NUMERIC(15, 2) NOT NULL DEFAULT 18000.00
        CHECK (balance >= 0),

    payment_pin_hash TEXT NOT NULL,

    UNIQUE (user_id, bank_id)
);


CREATE TYPE transaction_status AS ENUM (
    'failed',
    'success'
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,

    sender_account_id INTEGER NOT NULL
        REFERENCES accounts(id),

    receiver_account_id INTEGER NOT NULL
        REFERENCES accounts(id),

    amount NUMERIC(15, 2) NOT NULL
        CHECK (amount > 0),

    status transaction_status NOT NULL,

    idempotency_key UUID NOT NULL UNIQUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- migration :-

-- ALTER TABLE transactions
-- ADD COLUMN idempotency_key UUID;

-- UPDATE transactions
-- SET idempotency_key = gen_random_uuid()
-- WHERE idempotency_key IS NULL;

-- ALTER TABLE transactions
-- ALTER COLUMN idempotency_key SET NOT NULL;

-- ALTER TABLE transactions
-- ADD CONSTRAINT transactions_idempotency_key_unique
-- UNIQUE (idempotency_key);



-- for creating table in database use in this order - 

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    "firstName" VARCHAR(20) NOT NULL,
    "lastName" VARCHAR(20) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(20) NOT NULL,
    state VARCHAR(20) NOT NULL,
    "pinCode" VARCHAR(6) NOT NULL,
    "dateOfBirth" VARCHAR(10) NOT NULL,
    primary_account_id INTEGER
);


CREATE TABLE banks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);


INSERT INTO banks (name)
VALUES
    ('State Bank of India'),
    ('HDFC Bank'),
    ('ICICI Bank'),
    ('Union Bank of India'),
    ('Axis Bank'),
    ('Punjab National Bank'),
    ('Bank of India');


CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    bank_id INTEGER NOT NULL
        REFERENCES banks(id),

    account_number VARCHAR(16) UNIQUE NOT NULL,

    balance NUMERIC(15, 2) NOT NULL DEFAULT 18000.00
        CHECK (balance >= 0),

    payment_pin_hash TEXT NOT NULL,

    UNIQUE (user_id, bank_id)
);


ALTER TABLE users
ADD CONSTRAINT fk_primary_account
    FOREIGN KEY (primary_account_id)
    REFERENCES accounts(id)
    ON DELETE SET NULL;


CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,

    session_token TEXT UNIQUE NOT NULL,

    user_id INTEGER NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE TYPE transaction_status AS ENUM (
    'failed',
    'success'
);


CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,

    sender_account_id INTEGER NOT NULL
        REFERENCES accounts(id),

    receiver_account_id INTEGER NOT NULL
        REFERENCES accounts(id),

    amount NUMERIC(15, 2) NOT NULL
        CHECK (amount > 0),

    status transaction_status NOT NULL,

    idempotency_key UUID NOT NULL UNIQUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
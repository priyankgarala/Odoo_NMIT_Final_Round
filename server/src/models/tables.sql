-- USERS table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    bio TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

-- OTPs table
CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    user_id INT NULL,                      -- optional, link to users for forgot password
    email VARCHAR(150) NOT NULL,           -- plain email for register flow
    otp VARCHAR(10) NOT NULL,
    otp_expires TIMESTAMP NOT NULL,
    type VARCHAR(50) NOT NULL,             -- 'register' or 'forgot_password'
    name VARCHAR(100),                     -- optional, only for register
    password VARCHAR(255),                 -- optional, only for register
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure only one OTP per email & type
CREATE UNIQUE INDEX otps_email_type_idx ON otps(email, type);

-- PRODUCTS table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    quantity INT DEFAULT 1,
    category VARCHAR(100),
    condition VARCHAR(20) DEFAULT 'new',
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Helpful index for user-owned products
CREATE INDEX IF NOT EXISTS products_user_id_active_idx ON products(user_id) WHERE is_active = TRUE;
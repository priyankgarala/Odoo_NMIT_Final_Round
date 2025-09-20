-- ROLES table for dynamic permission management
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES 
('admin', 'Full system access', '{"users": {"create": true, "read": true, "update": true, "delete": true}, "products": {"create": true, "read": true, "update": true, "delete": true}, "contacts": {"create": true, "read": true, "update": true, "delete": true}}'),
('accountant', 'Financial and invoicing access', '{"products": {"create": true, "read": true, "update": true}, "contacts": {"create": true, "read": true, "update": true}, "invoices": {"create": true, "read": true, "update": true}}'),
('invoicing_user', 'Limited invoicing access', '{"products": {"read": true}, "contacts": {"read": true}, "invoices": {"create": true, "read": true}}'),
('vendor_azure', 'Vendor - Azure Furniture', 
 '{"purchase_orders": {"create": true, "read": true}}'),
('vendor_wooden', 'Vendor - Wooden World', 
 '{"purchase_orders": {"create": true, "read": true}}'),
-- Customers
('customer_nimesh', 'Customer - Nimesh Pathak', 
 '{"sales_orders": {"read": true}, "invoices": {"read": true}}'),
('customer_rohit', 'Customer - Rohit Sharma', 
 '{"sales_orders": {"read": true}, "invoices": {"read": true}}')
ON CONFLICT (name) DO NOTHING;

-- USERS table (updated for role-based access)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    login_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE SET NULL,
    bio TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CONTACTS table for vendors/customers (with or without login access)
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),
    company VARCHAR(100),
    address TEXT,
    contact_type VARCHAR(20) NOT NULL CHECK (contact_type IN ('vendor', 'customer')),
    has_login_access BOOLEAN DEFAULT FALSE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL, -- Link to users table if has login access
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTPs table (updated for login_id support)
CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    user_id INT NULL,                      -- optional, link to users for forgot password
    email VARCHAR(150) NOT NULL,           -- plain email for register flow
    login_id VARCHAR(50),                  -- login_id for registration
    otp VARCHAR(10) NOT NULL,
    otp_expires TIMESTAMP NOT NULL,
    type VARCHAR(50) NOT NULL,             -- 'register' or 'forgot_password'
    name VARCHAR(100),                     -- optional, only for register
    password VARCHAR(255),                 -- optional, only for register
    role_id INT REFERENCES roles(id),      -- role assignment for registration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('goods', 'service')),
    sales_price NUMERIC(12,2) DEFAULT 0.00,
    purchase_price NUMERIC(12,2) DEFAULT 0.00,
    sales_account_id INT REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    purchase_account_id INT REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    hsn_code VARCHAR(50),
    category VARCHAR(100),
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS taxes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,   -- e.g. GST 5%
    computation_method VARCHAR(20) NOT NULL CHECK (computation_method IN ('percentage', 'fixed')),
    value NUMERIC(10,2) NOT NULL,        -- 5.00 or 100.00
    applicable_on VARCHAR(20) NOT NULL CHECK (applicable_on IN ('sales', 'purchase', 'both')),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_taxes (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tax_id INT NOT NULL REFERENCES taxes(id) ON DELETE CASCADE,
    applicable_on VARCHAR(20) NOT NULL CHECK (applicable_on IN ('sales', 'purchase')),
    UNIQUE(product_id, tax_id, applicable_on)
);

CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id SERIAL PRIMARY KEY,
    account_name VARCHAR(150) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('asset', 'liability', 'expense', 'income', 'equity')),
    parent_account_id INT REFERENCES chart_of_accounts(id) ON DELETE SET NULL, -- for hierarchy
    code VARCHAR(5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ===============================
-- PURCHASE ORDERS
-- ===============================

CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'CONFIRMED', 'BILLED', 'CANCELLED')),
    total_amount NUMERIC(12,2) DEFAULT 0.00,
    tax_amount NUMERIC(12,2) DEFAULT 0.00,
    grand_total NUMERIC(12,2) DEFAULT 0.00,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);


CREATE TABLE purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5,2) DEFAULT 0.00,
    tax_amount NUMERIC(12,2) DEFAULT 0.00,
    line_total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_po_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_product_id ON purchase_order_items(product_id);


-- ===============================
-- SALES ORDERS
-- ===============================

CREATE TABLE sales_orders (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'CONFIRMED', 'INVOICED', 'CANCELLED')),
    total_amount NUMERIC(12,2) DEFAULT 0.00,
    tax_amount NUMERIC(12,2) DEFAULT 0.00,
    grand_total NUMERIC(12,2) DEFAULT 0.00,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);


CREATE TABLE sales_order_items (
    id SERIAL PRIMARY KEY,
    sales_order_id INT NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5,2) DEFAULT 0.00,
    tax_amount NUMERIC(12,2) DEFAULT 0.00,
    line_total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_so_items_so_id ON sales_order_items(sales_order_id);
CREATE INDEX idx_so_items_product_id ON sales_order_items(product_id);


-- Journal entries for accounting:
CREATE TABLE journal_entries (
  id BIGSERIAL PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  reference_type VARCHAR(50),
  reference_id BIGINT,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE,
  customer_id BIGINT NOT NULL REFERENCES contacts(id),
  so_id BIGINT REFERENCES sales_orders(id),
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status VARCHAR(30) CHECK (status IN ('UNPAID','PARTIALLY_PAID','PAID')) DEFAULT 'UNPAID',
  total_amount NUMERIC(15,2) DEFAULT 0,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE customer_invoice_items (
  id BIGSERIAL PRIMARY KEY,
  customer_invoice_id BIGINT NOT NULL REFERENCES customer_invoices(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity NUMERIC(14,3) NOT NULL,
  unit_price NUMERIC(15,2) NOT NULL,
  tax_id BIGINT REFERENCES taxes(id),
  line_total NUMERIC(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE INDEX idx_invoice_items_invoice_id ON customer_invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product_id ON customer_invoice_items(product_id);
-- Ensure only one OTP per email & type
CREATE INDEX IF NOT EXISTS coa_type_idx ON chart_of_accounts(type);
CREATE UNIQUE INDEX otps_email_type_idx ON otps(email, type);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_type_idx ON products(type);
CREATE INDEX IF NOT EXISTS product_taxes_product_idx ON product_taxes(product_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS users_login_id_idx ON users(login_id);
CREATE INDEX IF NOT EXISTS users_role_id_idx ON users(role_id);
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);
CREATE INDEX IF NOT EXISTS contacts_type_idx ON contacts(contact_type);

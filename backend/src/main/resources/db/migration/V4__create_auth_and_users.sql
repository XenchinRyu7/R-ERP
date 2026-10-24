-- ==============================================================================
-- V4: Authentication, Users, and Multi-Role RBAC (Staff & Mitra Portal)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS app_user (
    id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL, -- SUPERADMIN, KITCHEN_MANAGER, WAREHOUSE_LOGISTICS, PROCUREMENT_OFFICER, MITRA_OUTLET, SUPPLIER_VENDOR
    phone VARCHAR(30),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PENDING_APPROVAL, INACTIVE, REJECTED
    partner_type VARCHAR(30), -- 'OUTLET', 'VENDOR', or NULL for staff
    partner_name VARCHAR(150), -- Business / Store name submitted during mitra registration
    customer_id UUID REFERENCES customer(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES supplier(id) ON DELETE SET NULL,
    approval_notes TEXT,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_username ON app_user(username);
CREATE INDEX IF NOT EXISTS idx_user_email ON app_user(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON app_user(role);
CREATE INDEX IF NOT EXISTS idx_user_status ON app_user(status);
CREATE INDEX IF NOT EXISTS idx_user_customer_id ON app_user(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_supplier_id ON app_user(supplier_id);

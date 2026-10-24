-- ==============================================================================
-- V5: Add assigned warehouse to user (Office / Facility assignment)
-- ==============================================================================

ALTER TABLE app_user ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouse(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_user_warehouse_id ON app_user(warehouse_id);

-- =========================================================
-- V3: Production / Processing & Bill of Materials (BOM)
-- =========================================================

CREATE TABLE recipe (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    target_product_id UUID NOT NULL,
    yield_quantity NUMERIC(15, 2) NOT NULL DEFAULT 1.00,
    unit VARCHAR(20) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_recipe_target_product
        FOREIGN KEY (target_product_id)
        REFERENCES product(id)
);

CREATE TABLE recipe_item (
    id UUID PRIMARY KEY,
    recipe_id UUID NOT NULL,
    ingredient_product_id UUID NOT NULL,
    quantity NUMERIC(15, 4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_recipe_item_recipe
        FOREIGN KEY (recipe_id)
        REFERENCES recipe(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_item_ingredient
        FOREIGN KEY (ingredient_product_id)
        REFERENCES product(id)
);

CREATE TABLE production_order (
    id UUID PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    recipe_id UUID NOT NULL,
    warehouse_id UUID NOT NULL,
    planned_quantity NUMERIC(15, 2) NOT NULL,
    actual_quantity NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    start_date TIMESTAMP,
    completed_date TIMESTAMP,
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_production_recipe
        FOREIGN KEY (recipe_id)
        REFERENCES recipe(id),
    CONSTRAINT fk_production_warehouse
        FOREIGN KEY (warehouse_id)
        REFERENCES warehouse(id)
);

CREATE TABLE production_order_item (
    id UUID PRIMARY KEY,
    production_order_id UUID NOT NULL,
    ingredient_product_id UUID NOT NULL,
    planned_quantity NUMERIC(15, 4) NOT NULL,
    actual_consumed_quantity NUMERIC(15, 4) DEFAULT 0.0000,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_production_order_item_order
        FOREIGN KEY (production_order_id)
        REFERENCES production_order(id) ON DELETE CASCADE,
    CONSTRAINT fk_production_order_item_ingredient
        FOREIGN KEY (ingredient_product_id)
        REFERENCES product(id)
);

CREATE INDEX idx_recipe_target_product ON recipe(target_product_id);
CREATE INDEX idx_recipe_item_recipe ON recipe_item(recipe_id);
CREATE INDEX idx_production_order_recipe ON production_order(recipe_id);
CREATE INDEX idx_production_order_warehouse ON production_order(warehouse_id);
CREATE INDEX idx_production_order_status ON production_order(status);

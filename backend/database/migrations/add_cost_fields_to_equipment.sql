ALTER TABLE equipment 
ADD COLUMN purchase_cost DECIMAL(10,2) AFTER purchase_date,
ADD COLUMN depreciation_period INT AFTER purchase_cost,
ADD COLUMN liquidation_value DECIMAL(10,2) AFTER depreciation_period; 
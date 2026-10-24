-- ==============================================================================
-- MIGRATION: ADD available_from_date TO VEHICLES TABLE
-- Fixes: "Database Error: Could not find the 'available_from_date' column of 'vehicles' in the schema cache"
-- Platform: Transport Wala Commercial Logistics
-- ==============================================================================

-- 1. Ensure snake_case column 'available_from_date' exists with DEFAULT CURRENT_DATE
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS available_from_date DATE DEFAULT CURRENT_DATE;

-- 2. Also ensure quoted camelCase column '"availableFromDate"' exists 
--    (for databases initialized with camelCase column naming)
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS "availableFromDate" DATE DEFAULT CURRENT_DATE;

-- 3. Notify PostgREST to reload the schema cache immediately so newly added columns
--    are recognized without restarting the database server
NOTIFY pgrst, 'reload schema';

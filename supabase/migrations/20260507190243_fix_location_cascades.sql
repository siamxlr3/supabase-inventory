-- Ensure foreign keys for locations use ON DELETE CASCADE
-- This prevents 500 errors when deleting a location that has inventory history

-- 1. Inventory Levels
ALTER TABLE public.inventory_levels 
DROP CONSTRAINT IF EXISTS inventory_levels_location_id_fkey,
ADD CONSTRAINT inventory_levels_location_id_fkey 
    FOREIGN KEY (location_id) 
    REFERENCES public.locations(id) 
    ON DELETE CASCADE;

-- 2. Inventory Adjustments
ALTER TABLE public.inventory_adjustments 
DROP CONSTRAINT IF EXISTS inventory_adjustments_location_id_fkey,
ADD CONSTRAINT inventory_adjustments_location_id_fkey 
    FOREIGN KEY (location_id) 
    REFERENCES public.locations(id) 
    ON DELETE CASCADE;

-- 3. Alerts
ALTER TABLE public.alerts 
DROP CONSTRAINT IF EXISTS alerts_location_id_fkey,
ADD CONSTRAINT alerts_location_id_fkey 
    FOREIGN KEY (location_id) 
    REFERENCES public.locations(id) 
    ON DELETE CASCADE;

-- Fix RLS policies for inventory tables to allow all operations for the demo
-- These are necessary because the backend API uses the anon key and is subject to RLS

-- inventory_items policies
DROP POLICY IF EXISTS "Allow public insert on inventory_items" ON public.inventory_items;
CREATE POLICY "Allow public insert on inventory_items" ON public.inventory_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on inventory_items" ON public.inventory_items;
CREATE POLICY "Allow public update on inventory_items" ON public.inventory_items FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on inventory_items" ON public.inventory_items;
CREATE POLICY "Allow public delete on inventory_items" ON public.inventory_items FOR DELETE USING (true);

-- inventory_levels policies
DROP POLICY IF EXISTS "Allow public insert on inventory_levels" ON public.inventory_levels;
CREATE POLICY "Allow public insert on inventory_levels" ON public.inventory_levels FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on inventory_levels" ON public.inventory_levels;
CREATE POLICY "Allow public delete on inventory_levels" ON public.inventory_levels FOR DELETE USING (true);

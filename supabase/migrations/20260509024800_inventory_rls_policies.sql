-- Allow public access to inventory tables for the demo/app
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on inventory_items" ON public.inventory_items;
CREATE POLICY "Allow public read on inventory_items" ON public.inventory_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on inventory_levels" ON public.inventory_levels;
CREATE POLICY "Allow public read on inventory_levels" ON public.inventory_levels FOR SELECT USING (true);

-- Also allow update for the anon/authenticated role for processing
DROP POLICY IF EXISTS "Allow public update on inventory_levels" ON public.inventory_levels;
CREATE POLICY "Allow public update on inventory_levels" ON public.inventory_levels FOR UPDATE USING (true) WITH CHECK (true);

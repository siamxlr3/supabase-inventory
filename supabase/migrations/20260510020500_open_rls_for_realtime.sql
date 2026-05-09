-- Ensure RLS is enabled but open for development on these tables
-- This helps Realtime work if RLS was previously enabled without policies

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for orders" ON public.orders;
CREATE POLICY "Allow all for orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Order Line Items
ALTER TABLE public.order_line_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for order_line_items" ON public.order_line_items;
CREATE POLICY "Allow all for order_line_items" ON public.order_line_items FOR ALL USING (true) WITH CHECK (true);

-- Fulfillment Orders
ALTER TABLE public.fulfillment_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for fulfillment_orders" ON public.fulfillment_orders;
CREATE POLICY "Allow all for fulfillment_orders" ON public.fulfillment_orders FOR ALL USING (true) WITH CHECK (true);

-- Fulfillments
ALTER TABLE public.fulfillments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for fulfillments" ON public.fulfillments;
CREATE POLICY "Allow all for fulfillments" ON public.fulfillments FOR ALL USING (true) WITH CHECK (true);

-- Fulfillment Line Items
ALTER TABLE public.fulfillment_line_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for fulfillment_line_items" ON public.fulfillment_line_items;
CREATE POLICY "Allow all for fulfillment_line_items" ON public.fulfillment_line_items FOR ALL USING (true) WITH CHECK (true);

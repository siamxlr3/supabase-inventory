-- Update order_line_items table with new fields
ALTER TABLE public.order_line_items 
ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES public.inventory_items(id),
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id),
ADD COLUMN IF NOT EXISTS fulfillable_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_discount DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS requires_shipping BOOLEAN DEFAULT TRUE;

-- Update existing fulfillable_quantity to match quantity for old records
UPDATE public.order_line_items 
SET fulfillable_quantity = quantity 
WHERE fulfillable_quantity = 0;

-- Rename variant_id to product_variant_id for consistency with user request if needed
-- But I will keep both or just use product_variant_id as requested.
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_line_items' AND column_name='variant_id') THEN
    ALTER TABLE public.order_line_items RENAME COLUMN variant_id TO product_variant_id;
  END IF;
END $$;

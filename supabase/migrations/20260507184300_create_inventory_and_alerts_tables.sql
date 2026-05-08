-- Create Inventory Levels Table
CREATE TABLE IF NOT EXISTS public.inventory_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    on_hand INTEGER DEFAULT 0 NOT NULL,
    committed INTEGER DEFAULT 0 NOT NULL,
    incoming INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(inventory_item_id, location_id)
);

-- Create Inventory Adjustments Table
CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    delta INTEGER NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('sale', 'return', 'received', 'damaged', 'correction', 'cycle_count')),
    reference_document_type TEXT,
    reference_document_id TEXT,
    happened_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    resolved BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Indices
CREATE INDEX IF NOT EXISTS idx_inventory_levels_item_loc ON public.inventory_levels(inventory_item_id, location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_levels_available_calc ON public.inventory_levels((on_hand - committed));

CREATE INDEX IF NOT EXISTS idx_adjustments_item_loc ON public.inventory_adjustments(inventory_item_id, location_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_reason ON public.inventory_adjustments(reason);
CREATE INDEX IF NOT EXISTS idx_adjustments_happened_at ON public.inventory_adjustments(happened_at);

CREATE INDEX IF NOT EXISTS idx_alerts_item_loc ON public.alerts(inventory_item_id, location_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON public.alerts(resolved);

-- Add Updated At Triggers
CREATE TRIGGER update_inventory_levels_updated_at BEFORE UPDATE ON public.inventory_levels FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_levels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_adjustments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

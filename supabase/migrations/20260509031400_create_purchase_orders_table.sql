-- Create Purchase Orders Table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    destination_location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    name TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partial', 'received', 'closed')),
    note TEXT,
    total_cost DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    currency_code TEXT DEFAULT 'USD' NOT NULL,
    estimated_arrival_date TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Purchase Order Line Items Table
CREATE TABLE IF NOT EXISTS public.purchase_order_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    product_variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    quantity_received INTEGER DEFAULT 0 NOT NULL CHECK (quantity_received >= 0),
    unit_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexing Strategy
CREATE INDEX IF NOT EXISTS idx_po_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_destination_id ON public.purchase_orders(destination_location_id);
CREATE INDEX IF NOT EXISTS idx_po_name ON public.purchase_orders(name);
CREATE INDEX IF NOT EXISTS idx_po_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_created_at ON public.purchase_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_po_line_items_po_id ON public.purchase_order_line_items(purchase_order_id);

-- Trigger for updated_at
CREATE TRIGGER update_purchase_orders_updated_at 
    BEFORE UPDATE ON public.purchase_orders 
    FOR EACH ROW 
    EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_purchase_order_line_items_updated_at 
    BEFORE UPDATE ON public.purchase_order_line_items 
    FOR EACH ROW 
    EXECUTE PROCEDURE public.update_updated_at_column();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_order_line_items;

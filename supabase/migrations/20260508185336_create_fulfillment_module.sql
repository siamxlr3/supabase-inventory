-- Create Fulfillment Orders table
CREATE TABLE IF NOT EXISTS public.fulfillment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations(id),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'fulfilled', 'cancelled')),
    request_status VARCHAR(50) DEFAULT 'unsubmitted' CHECK (request_status IN ('unsubmitted', 'submitted', 'accepted', 'rejected')),
    fulfill_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Fulfillments (Shipments) table
CREATE TABLE IF NOT EXISTS public.fulfillments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    fulfillment_order_id UUID REFERENCES public.fulfillment_orders(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
    tracking_number VARCHAR(255),
    tracking_company VARCHAR(255),
    tracking_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Fulfillment Line Items table
CREATE TABLE IF NOT EXISTS public.fulfillment_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fulfillment_id UUID NOT NULL REFERENCES public.fulfillments(id) ON DELETE CASCADE,
    order_line_item_id UUID NOT NULL REFERENCES public.order_line_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_fulfillment_orders_order_id ON public.fulfillment_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_orders_location_id ON public.fulfillment_orders(location_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_order_id ON public.fulfillments(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_fulfillment_order_id ON public.fulfillments(fulfillment_order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_tracking_number ON public.fulfillments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_fulfillments_tracking_company ON public.fulfillments(tracking_company);
CREATE INDEX IF NOT EXISTS idx_fulfillment_line_items_fulfillment_id ON public.fulfillment_line_items(fulfillment_id);

-- Add updated_at triggers
CREATE TRIGGER update_fulfillment_orders_updated_at
    BEFORE UPDATE ON public.fulfillment_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fulfillments_updated_at
    BEFORE UPDATE ON public.fulfillments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

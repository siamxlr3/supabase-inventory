-- Create Refunds Module

CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    note TEXT,
    restock BOOLEAN DEFAULT true NOT NULL,
    duties_refunded DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    total_amount DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.refund_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refund_id UUID NOT NULL REFERENCES public.refunds(id) ON DELETE CASCADE,
    order_line_item_id UUID NOT NULL REFERENCES public.order_line_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    restocked BOOLEAN DEFAULT true NOT NULL,
    amount DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON public.refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_customer_id ON public.refunds(customer_id);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON public.refunds(created_at);
CREATE INDEX IF NOT EXISTS idx_refund_line_items_refund_id ON public.refund_line_items(refund_id);
CREATE INDEX IF NOT EXISTS idx_refund_line_items_order_line_item_id ON public.refund_line_items(order_line_item_id);

-- Triggers
CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON public.refunds FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_refund_line_items_updated_at BEFORE UPDATE ON public.refund_line_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.refunds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.refund_line_items;

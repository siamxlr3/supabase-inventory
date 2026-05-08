-- Create Locations Table
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address1 TEXT NOT NULL,
    city TEXT NOT NULL,
    country_code TEXT NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    fulfills_online_orders BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Indices for Performance
CREATE INDEX IF NOT EXISTS idx_locations_name ON public.locations USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_locations_address1 ON public.locations USING gin (to_tsvector('english', address1));
CREATE INDEX IF NOT EXISTS idx_locations_city ON public.locations(city);
CREATE INDEX IF NOT EXISTS idx_locations_active ON public.locations(active);
CREATE INDEX IF NOT EXISTS idx_locations_created_at ON public.locations(created_at);

-- Add Updated At Trigger
CREATE TRIGGER update_locations_updated_at 
BEFORE UPDATE ON public.locations 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

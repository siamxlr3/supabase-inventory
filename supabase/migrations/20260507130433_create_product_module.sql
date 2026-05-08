-- Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    vendor TEXT,
    product_type TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    handle TEXT UNIQUE NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Product Options Table (e.g., Color, Size)
CREATE TABLE IF NOT EXISTS public.product_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    price DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    compare_at_price DECIMAL(12,2),
    weight DECIMAL(12,3),
    weight_unit TEXT DEFAULT 'kg',
    position INTEGER DEFAULT 0,
    taxable BOOLEAN DEFAULT true NOT NULL,
    requires_shipping BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Product Option Values (Junction for Variants and Options)
CREATE TABLE IF NOT EXISTS public.product_option_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_id UUID NOT NULL REFERENCES public.product_options(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(option_id, variant_id)
);

-- Create Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    cost DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    country_code_of_origin TEXT,
    harmonized_system_code TEXT,
    tracked BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Indices for Performance
CREATE INDEX IF NOT EXISTS idx_products_title ON public.products USING gin (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_products_vendor ON public.products(vendor);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);

CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_variants_barcode ON public.product_variants(barcode);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.product_variants(product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_variant_id ON public.inventory_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory_items(sku);

-- Add Updated At Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_product_options_updated_at BEFORE UPDATE ON public.product_options FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_product_option_values_updated_at BEFORE UPDATE ON public.product_option_values FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

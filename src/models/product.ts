export type ProductStatus = 'draft' | 'active' | 'archived';

export interface Product {
    id: string;
    title: string;
    description?: string;
    vendor: string | null;
    product_type: string | null;
    status: ProductStatus;
    handle: string;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProductOption {
    id: string;
    product_id: string;
    name: string;
    position: number;
    created_at: string;
    updated_at: string;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    title: string;
    sku: string | null;
    barcode: string | null;
    price: number;
    compare_at_price: number | null;
    weight: number | null;
    weight_unit: string;
    position: number;
    taxable: boolean;
    requires_shipping: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProductOptionValue {
    id: string;
    option_id: string;
    variant_id: string;
    value: string;
    created_at: string;
    updated_at: string;
}

export interface InventoryItem {
    id: string;
    variant_id: string;
    sku: string | null;
    cost: number;
    country_code_of_origin: string | null;
    harmonized_system_code: string | null;
    tracked: boolean;
    created_at: string;
    updated_at: string;
}

// Combined DTO for API responses
export interface ProductDetail extends Product {
    options: ProductOption[];
    variants: (ProductVariant & {
        option_values: ProductOptionValue[];
        inventory_item: InventoryItem | null;
    })[];
}

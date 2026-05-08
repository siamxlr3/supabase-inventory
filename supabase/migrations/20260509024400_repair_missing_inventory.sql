-- Ensure all product variants have corresponding inventory items
INSERT INTO public.inventory_items (variant_id, sku, cost, tracked)
SELECT 
    pv.id as variant_id, 
    pv.sku, 
    0 as cost, 
    true as tracked
FROM public.product_variants pv
LEFT JOIN public.inventory_items ii ON ii.variant_id = pv.id
WHERE ii.id IS NULL;

-- Ensure all inventory items have inventory levels for all locations
INSERT INTO public.inventory_levels (inventory_item_id, location_id, on_hand, committed, incoming)
SELECT 
    ii.id as inventory_item_id,
    l.id as location_id,
    0 as on_hand,
    0 as committed,
    0 as incoming
FROM public.inventory_items ii
CROSS JOIN public.locations l
LEFT JOIN public.inventory_levels il ON il.inventory_item_id = ii.id AND il.location_id = l.id
WHERE il.id IS NULL;

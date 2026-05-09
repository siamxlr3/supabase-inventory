-- Create function to automatically check and manage low stock alerts
CREATE OR REPLACE FUNCTION public.check_low_stock_alerts()
RETURNS TRIGGER AS $$
DECLARE
    v_available INTEGER;
    v_threshold INTEGER := 10;
    v_product_title TEXT;
BEGIN
    v_available := NEW.on_hand - NEW.committed;
    
    -- Fetch product title for alert message
    SELECT pv.title INTO v_product_title
    FROM public.inventory_items ii
    JOIN public.product_variants pv ON pv.id = ii.variant_id
    WHERE ii.id = NEW.inventory_item_id;

    IF v_available <= v_threshold THEN
        -- Create alert if not exists
        IF NOT EXISTS (
            SELECT 1 FROM public.alerts 
            WHERE inventory_item_id = NEW.inventory_item_id 
              AND location_id = NEW.location_id 
              AND resolved = false
        ) THEN
            INSERT INTO public.alerts (inventory_item_id, location_id, type, message, resolved)
            VALUES (
                NEW.inventory_item_id, 
                NEW.location_id, 
                'low_stock', 
                'Low stock alert for ' || COALESCE(v_product_title, 'item') || '. Available: ' || v_available || ', Threshold: ' || v_threshold, 
                false
            );
        END IF;
    ELSE
        -- Auto-resolve alert
        UPDATE public.alerts 
        SET resolved = true, updated_at = now()
        WHERE inventory_item_id = NEW.inventory_item_id 
          AND location_id = NEW.location_id 
          AND resolved = false;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to allow safe reruns
DROP TRIGGER IF EXISTS trigger_check_low_stock ON public.inventory_levels;

-- Create the trigger on inventory_levels
CREATE TRIGGER trigger_check_low_stock
AFTER INSERT OR UPDATE OF on_hand, committed ON public.inventory_levels
FOR EACH ROW
EXECUTE FUNCTION public.check_low_stock_alerts();

-- Retroactively generate alerts for any existing low stock items
UPDATE public.inventory_levels SET updated_at = now();

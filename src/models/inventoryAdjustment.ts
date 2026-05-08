/**
 * TypeScript interfaces for Inventory Adjustments.
 * Adjustments are append-only.
 */

export type AdjustmentReason = 
  | 'sale' 
  | 'return' 
  | 'received' 
  | 'damaged' 
  | 'correction' 
  | 'cycle_count';

export interface InventoryAdjustment {
  id: string;
  inventory_item_id: string;
  location_id: string;
  delta: number;
  reason: AdjustmentReason;
  reference_document_type?: string;
  reference_document_id?: string;
  happened_at: string;
  created_at: string;
  
  // Joins
  inventory_item?: any;
  location?: any;
}

export interface AdjustmentQuery {
  inventory_item_id?: string;
  location_id?: string;
  reason?: AdjustmentReason;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

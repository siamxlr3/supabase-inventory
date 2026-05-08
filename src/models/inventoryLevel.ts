/**
 * TypeScript interfaces for Inventory Levels.
 * available = on_hand - committed
 */

export interface InventoryLevel {
  id: string;
  inventory_item_id: string;
  location_id: string;
  on_hand: number;
  committed: number;
  incoming: number;
  available: number; // Computed in logic, not stored
  created_at: string;
  updated_at: string;
  
  // Joins
  inventory_item?: any;
  location?: any;
}

export interface InventoryQuery {
  inventory_item_id?: string;
  location_id?: string;
  page?: number;
  per_page?: number;
  low_stock_only?: boolean;
}

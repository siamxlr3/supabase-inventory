/**
 * TypeScript interfaces for Low Stock Alerts.
 */

export interface Alert {
  id: string;
  inventory_item_id: string;
  location_id: string;
  type: string;
  message: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
  
  // Joins
  inventory_item?: any;
  location?: any;
}

export interface AlertQuery {
  inventory_item_id?: string;
  location_id?: string;
  resolved?: boolean;
  page?: number;
  per_page?: number;
}

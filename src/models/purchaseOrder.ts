import { Supplier } from './supplier';
import { Location } from './location';

export type PurchaseOrderStatus = 'draft' | 'sent' | 'partial' | 'received' | 'closed';

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  destination_location_id: string;
  name: string;
  status: PurchaseOrderStatus;
  note?: string;
  total_cost: number;
  currency_code: string;
  estimated_arrival_date?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  // Joins
  supplier?: Supplier;
  destination?: Location;
  line_items?: PurchaseOrderLineItem[];
}

export interface PurchaseOrderLineItem {
  id: string;
  purchase_order_id: string;
  inventory_item_id: string;
  product_variant_id: string;
  quantity: number;
  quantity_received: number;
  unit_cost: number;
  created_at: string;
  updated_at: string;
  // Joins
  product_variant?: any;
}

export interface CreatePurchaseOrderDTO {
  supplier_id: string;
  destination_location_id: string;
  name: string;
  note?: string;
  currency_code?: string;
  estimated_arrival_date?: string;
  line_items: {
    inventory_item_id: string;
    product_variant_id: string;
    quantity: number;
    unit_cost: number;
  }[];
}

export interface ReceiveGoodsDTO {
  line_items: {
    id: string; // Line item ID
    quantity_to_receive: number;
  }[];
}

export interface POFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: PurchaseOrderStatus;
  supplier_id?: string;
  location_id?: string;
  from_date?: string;
  to_date?: string;
}

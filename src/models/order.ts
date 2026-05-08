export type FinancialStatus = 'pending' | 'authorized' | 'paid' | 'partially_paid' | 'refunded' | 'voided' | 'partially_refunded';
export type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'restocked' | 'voided';

export interface Order {
  id: string;
  name: string;
  customer_id?: string;
  email: string;
  financial_status: FinancialStatus;
  fulfillment_status: FulfillmentStatus;
  payment_method?: string;
  payment_reference?: string;
  total_price: number;
  subtotal_price: number;
  total_tax: number;
  currency: string;
  location_id?: string;
  location?: any;
  cancel_reason?: string;
  cancelled_at?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  line_items?: OrderLineItem[];
}

export interface OrderLineItem {
  id: string;
  order_id: string;
  variant_id?: string;
  title: string;
  quantity: number;
  price: number;
  total_discount: number;
  tax_price: number;
  sku?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderDTO {
  customer_id?: string;
  email: string;
  location_id: string;
  payment_method?: string;
  payment_reference?: string;
  financial_status?: FinancialStatus;
  currency?: string;
  line_items: {
    variant_id: string;
    quantity: number;
    price: number;
    title: string;
    sku?: string;
  }[];
}

export interface OrderFilters {
  page?: number;
  per_page?: number;
  search?: string;
  financial_status?: FinancialStatus;
  fulfillment_status?: FulfillmentStatus;
  location_id?: string;
  from_date?: string;
  to_date?: string;
}

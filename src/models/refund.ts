import { OrderLineItem, Order } from './order';
import { Customer } from './customer';

export type RefundStatus = 'pending' | 'completed' | 'rejected';

export interface RefundLineItem {
  id: string;
  refund_id: string;
  order_line_item_id: string;
  quantity: number;
  restocked: boolean;
  amount: number;
  created_at: string;
  updated_at: string;
  order_line_item?: OrderLineItem;
}

export interface Refund {
  id: string;
  order_id: string;
  customer_id?: string;
  note?: string;
  restock: boolean;
  duties_refunded: number;
  total_amount: number;
  status: RefundStatus;
  created_at: string;
  updated_at: string;
  order?: Order;
  customer?: Customer;
  line_items?: RefundLineItem[];
}

export interface RefundQuery {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
}

export interface CreateRefundLineItemDTO {
  order_line_item_id: string;
  quantity: number;
  restocked?: boolean;
}

export interface CreateRefundDTO {
  order_id: string;
  note?: string;
  restock: boolean;
  duties_refunded?: number;
  line_items: CreateRefundLineItemDTO[];
}

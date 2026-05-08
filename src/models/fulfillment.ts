export type FulfillmentOrderStatus = 'open' | 'fulfilled' | 'cancelled';
export type FulfillmentRequestStatus = 'unsubmitted' | 'submitted' | 'accepted' | 'rejected';
export type FulfillmentStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export interface FulfillmentOrder {
    id: string;
    order_id: string;
    location_id: string;
    status: FulfillmentOrderStatus;
    request_status: FulfillmentRequestStatus;
    fulfill_at?: string;
    created_at: string;
    updated_at: string;
    // Joined data
    location?: any;
    order?: any;
}

export interface Fulfillment {
    id: string;
    order_id: string;
    fulfillment_order_id?: string;
    status: FulfillmentStatus;
    tracking_number?: string;
    tracking_company?: string;
    tracking_url?: string;
    created_at: string;
    updated_at: string;
    // Joined data
    line_items?: FulfillmentLineItem[];
}

export interface FulfillmentLineItem {
    id: string;
    fulfillment_id: string;
    order_line_item_id: string;
    quantity: number;
    created_at: string;
    // Joined data
    order_line_item?: any;
}

export interface CreateFulfillmentDTO {
    order_id: string;
    fulfillment_order_id?: string;
    tracking_number?: string;
    tracking_company?: string;
    tracking_url?: string;
    line_items: {
        order_line_item_id: string;
        quantity: number;
    }[];
}

export interface FulfillmentFilters {
    page: number;
    per_page: number;
    search?: string;
    status?: FulfillmentStatus;
    from_date?: string;
    to_date?: string;
}

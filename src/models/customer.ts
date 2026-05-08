export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zip_code?: string;
  status: 'active' | 'inactive';
  fulfills_online_orders: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateCustomerDTO = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCustomerDTO = Partial<CreateCustomerDTO>;

export interface CustomerFilters {
  search?: string;
  status?: 'active' | 'inactive';
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

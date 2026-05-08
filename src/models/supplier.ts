export type SupplierStatus = 'active' | 'inactive';

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currency_code: string;
  payment_terms?: string;
  status: SupplierStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierDTO {
  name: string;
  email: string;
  phone?: string;
  currency_code: string;
  payment_terms?: string;
  status?: SupplierStatus;
}

export interface UpdateSupplierDTO extends Partial<CreateSupplierDTO> {}

export interface SupplierFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: SupplierStatus;
  from_date?: string;
  to_date?: string;
}

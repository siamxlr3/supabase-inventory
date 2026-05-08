/**
 * TypeScript interfaces and types for the Location module.
 * Follows the DTO-style structure as per project rules.
 */

export interface Location {
  id: string;
  name: string;
  address1: string;
  city: string;
  country_code: string;
  active: boolean;
  fulfills_online_orders: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateLocationDTO = Omit<Location, 'id' | 'created_at' | 'updated_at'>;
export type UpdateLocationDTO = Partial<CreateLocationDTO>;

export interface LocationQuery {
  page?: number;
  per_page?: number;
  search?: string;
  active?: boolean;
  from_date?: string;
  to_date?: string;
}

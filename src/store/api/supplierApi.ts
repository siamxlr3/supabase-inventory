import { baseApi } from './baseApi';
import { Supplier, CreateSupplierDTO, UpdateSupplierDTO, SupplierFilters } from '@/models/supplier';
import { ApiResponse } from '@/lib/response';

export const supplierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<ApiResponse<Supplier[]>, SupplierFilters>({
      query: (filters) => ({
        url: '/suppliers',
        params: filters,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Supplier' as const, id })),
              { type: 'Supplier', id: 'LIST' },
            ]
          : [{ type: 'Supplier', id: 'LIST' }],
    }),
    getSupplierById: builder.query<ApiResponse<Supplier>, string>({
      query: (id) => `/suppliers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Supplier', id }],
    }),
    createSupplier: builder.mutation<ApiResponse<Supplier>, CreateSupplierDTO>({
      query: (body) => ({
        url: '/suppliers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),
    updateSupplier: builder.mutation<ApiResponse<Supplier>, { id: string; body: UpdateSupplierDTO }>({
      query: ({ id, body }) => ({
        url: `/suppliers/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Supplier', id },
        { type: 'Supplier', id: 'LIST' },
      ],
    }),
    deleteSupplier: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi;

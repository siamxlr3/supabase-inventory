import { baseApi } from './baseApi';
import { 
  PurchaseOrder, 
  CreatePurchaseOrderDTO, 
  POFilters
} from '@/models/purchaseOrder';
import { ApiResponse } from '@/lib/response';

export const purchaseOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query<ApiResponse<PurchaseOrder[]>, POFilters>({
      query: (filters) => ({
        url: '/purchase-orders',
        params: filters,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'PurchaseOrder' as const, id })),
              { type: 'PurchaseOrder', id: 'LIST' },
            ]
          : [{ type: 'PurchaseOrder', id: 'LIST' }],
    }),
    getPurchaseOrderById: builder.query<ApiResponse<PurchaseOrder>, string>({
      query: (id) => `/purchase-orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'PurchaseOrder', id }],
    }),
    createAndReceivePO: builder.mutation<ApiResponse<PurchaseOrder>, CreatePurchaseOrderDTO>({
      query: (body) => ({
        url: '/purchase-orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'PurchaseOrder', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' }
      ],
    }),
    deletePurchaseOrder: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/purchase-orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PurchaseOrder', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreateAndReceivePOMutation,
  useDeletePurchaseOrderMutation,
} = purchaseOrderApi;

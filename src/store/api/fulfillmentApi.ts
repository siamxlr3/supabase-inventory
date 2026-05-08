import { baseApi } from './baseApi';
import { ApiResponse } from '@/lib/response';
import { Fulfillment, CreateFulfillmentDTO, FulfillmentFilters } from '@/models/fulfillment';

export const fulfillmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFulfillments: builder.query<ApiResponse<Fulfillment[]>, FulfillmentFilters | void>({
      query: (filters) => ({
        url: '/fulfillments',
        params: filters || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Fulfillment' as const, id })),
              { type: 'Fulfillment', id: 'LIST' },
            ]
          : [{ type: 'Fulfillment', id: 'LIST' }],
    }),
    getFulfillmentOrders: builder.query<ApiResponse<any[]>, any>({
      query: (filters) => ({
        url: '/fulfillments/orders',
        params: filters || {},
      }),
      providesTags: [{ type: 'Fulfillment', id: 'QUEUE' }],
    }),
    createFulfillment: builder.mutation<ApiResponse<Fulfillment>, CreateFulfillmentDTO>({
      query: (body) => ({
        url: '/fulfillments',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Fulfillment', id: 'LIST' },
        { type: 'Order', id: 'LIST' }, // Status changes
        'Inventory' // Committed qty changes
      ],
    }),
    updateFulfillment: builder.mutation<ApiResponse<Fulfillment>, { id: string; body: Partial<Fulfillment> }>({
      query: ({ id, body }) => ({
        url: `/fulfillments/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Fulfillment', id },
        { type: 'Fulfillment', id: 'LIST' },
      ],
    }),
    deleteFulfillment: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/fulfillments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Fulfillment', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetFulfillmentsQuery,
  useGetFulfillmentOrdersQuery,
  useCreateFulfillmentMutation,
  useUpdateFulfillmentMutation,
  useDeleteFulfillmentMutation,
} = fulfillmentApi;

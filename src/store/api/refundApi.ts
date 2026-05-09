import { baseApi } from './baseApi';
import { ApiResponse } from '@/lib/response';
import { Refund, RefundQuery, CreateRefundDTO } from '@/models/refund';

export const refundApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRefunds: builder.query<ApiResponse<Refund[]>, RefundQuery | void>({
      query: (params) => ({
        url: '/returns',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Refund' as const, id })),
              { type: 'Refund', id: 'LIST' },
            ]
          : [{ type: 'Refund', id: 'LIST' }],
    }),
    getRefundById: builder.query<ApiResponse<Refund>, string>({
      query: (id) => `/returns/${id}`,
      providesTags: (result, error, id) => [{ type: 'Refund', id }],
    }),
    createRefund: builder.mutation<ApiResponse<Refund>, CreateRefundDTO>({
      query: (body) => ({
        url: '/returns',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Refund', id: 'LIST' },
        { type: 'Order', id: 'LIST' },
        'Inventory',
        'Adjustments'
      ],
    }),
  }),
});

export const {
  useGetRefundsQuery,
  useGetRefundByIdQuery,
  useCreateRefundMutation,
} = refundApi;

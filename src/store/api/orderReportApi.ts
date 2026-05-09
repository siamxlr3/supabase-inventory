import { baseApi } from './baseApi';
import { ApiResponse } from '@/lib/response';

export const orderReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrderOverviewReport: builder.query<ApiResponse<any>, { period?: string } | void>({
      query: (params) => ({
        url: '/reports/orders/overview',
        params: params || {},
      }),
      providesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    getTopSellersReport: builder.query<ApiResponse<any[]>, void>({
      query: () => '/reports/orders/top-sellers',
      providesTags: [{ type: 'Order', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetOrderOverviewReportQuery,
  useGetTopSellersReportQuery,
} = orderReportApi;

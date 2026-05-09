import { baseApi } from './baseApi';
import { ApiResponse } from '@/lib/response';

export const inventoryReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockLevelsReport: builder.query<ApiResponse<any[]>, { page?: number; per_page?: number; search?: string } | void>({
      query: (params) => ({
        url: '/reports/inventory/levels',
        params: params || {},
      }),
      providesTags: [{ type: 'Inventory', id: 'LIST' }],
    }),
    getValuationReport: builder.query<ApiResponse<{ totalValue: number; valuationByCategory: any[] }>, void>({
      query: () => '/reports/inventory/valuation',
      providesTags: [{ type: 'Inventory', id: 'LIST' }],
    }),
    getAgingItemsReport: builder.query<ApiResponse<any[]>, { days?: number } | void>({
      query: (params) => ({
        url: '/reports/inventory/aging',
        params: params || {},
      }),
      providesTags: [{ type: 'Inventory', id: 'LIST' }],
    }),
    getAdjustmentsReport: builder.query<ApiResponse<any[]>, { page?: number; per_page?: number; reason?: string; from_date?: string; to_date?: string } | void>({
      query: (params) => ({
        url: '/reports/inventory/adjustments',
        params: params || {},
      }),
      providesTags: [{ type: 'Inventory', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetStockLevelsReportQuery,
  useGetValuationReportQuery,
  useGetAgingItemsReportQuery,
  useGetAdjustmentsReportQuery,
} = inventoryReportApi;

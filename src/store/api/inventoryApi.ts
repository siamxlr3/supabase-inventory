import { baseApi } from './baseApi';
import { ApiResponse } from '@/lib/response';
import { InventoryLevel, InventoryQuery } from '@/models/inventoryLevel';
import { InventoryAdjustment, AdjustmentQuery } from '@/models/inventoryAdjustment';
import { Alert, AlertQuery } from '@/models/alert';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Inventory Levels
    getInventoryLevels: builder.query<ApiResponse<InventoryLevel[]>, InventoryQuery>({
      query: (params) => ({ url: '/inventory/levels', params }),
      providesTags: ['Inventory'],
    }),
    
    // Adjustments
    getAdjustments: builder.query<ApiResponse<InventoryAdjustment[]>, AdjustmentQuery>({
      query: (params) => ({ url: '/inventory/adjustments', params }),
      providesTags: ['Adjustments'],
    }),
    createAdjustment: builder.mutation<ApiResponse<any>, Partial<InventoryAdjustment>>({
      query: (body) => ({
        url: '/inventory/adjustments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Inventory', 'Adjustments', 'Alerts'],
    }),

    // Alerts
    getAlerts: builder.query<ApiResponse<Alert[]>, AlertQuery>({
      query: (params) => ({ url: '/alerts', params }),
      providesTags: ['Alerts'],
    }),
    resolveAlert: builder.mutation<ApiResponse<Alert>, string>({
      query: (id) => ({
        url: `/alerts/${id}/resolve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Alerts'],
    }),
  }),
});

export const {
  useGetInventoryLevelsQuery,
  useGetAdjustmentsQuery,
  useCreateAdjustmentMutation,
  useGetAlertsQuery,
  useResolveAlertMutation,
} = inventoryApi;

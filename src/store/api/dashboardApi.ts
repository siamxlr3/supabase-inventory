import { baseApi } from './baseApi';
import { ApiResponse } from '@/lib/response';

export interface AnalyticsQuery {
  from_date?: string;
  to_date?: string;
}

export interface AnalyticsData {
  revenueData: { date: string; revenue: number; orders: number }[];
  ordersByCategory: { name: string; value: number }[];
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalytics: builder.query<ApiResponse<AnalyticsData>, AnalyticsQuery | void>({
      query: (params) => ({
        url: '/dashboard/analytics',
        params: params || {},
      }),
      providesTags: ['Order'], // Invalidate whenever orders change
    }),
  }),
});

export const { useGetAnalyticsQuery } = dashboardApi;

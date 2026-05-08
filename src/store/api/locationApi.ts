import { baseApi } from './baseApi';
import { ApiResponse } from '@/lib/response';
import { Location, LocationQuery } from '@/models/location';

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLocations: builder.query<ApiResponse<Location[]>, LocationQuery>({
      query: (params) => ({
        url: '/locations',
        params,
      }),
      providesTags: ['Locations'],
    }),
    getLocation: builder.query<ApiResponse<Location>, string>({
      query: (id) => `/locations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Locations', id }],
    }),
    createLocation: builder.mutation<ApiResponse<Location>, Partial<Location>>({
      query: (body) => ({
        url: '/locations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Locations'],
    }),
    updateLocation: builder.mutation<ApiResponse<Location>, { id: string; body: Partial<Location> }>({
      query: ({ id, body }) => ({
        url: `/locations/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['Locations', { type: 'Locations', id }],
    }),
    deleteLocation: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/locations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Locations'],
    }),
  }),
});

export const {
  useGetLocationsQuery,
  useGetLocationQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} = locationApi;

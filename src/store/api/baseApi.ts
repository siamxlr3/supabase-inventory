import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import toast from 'react-hot-toast';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    const baseQuery = fetchBaseQuery({ baseUrl: '/api/v1' });
    const result = await baseQuery(args, api, extraOptions);

    if (result.error) {
      const message = (result.error.data as any)?.message || 'An unexpected error occurred';
      toast.error(message);
    }

    return result;
  },
  endpoints: () => ({}),
  tagTypes: ['Products', 'Locations', 'Inventory', 'Adjustments', 'Alerts', 'Customer', 'Order', 'Fulfillment', 'Supplier', 'PurchaseOrder', 'Refund'],
});

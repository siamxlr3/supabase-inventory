import { baseApi } from './baseApi';
import { Product, ProductDetail } from '@/models/product';

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<{ data: ProductDetail[]; meta: any }, any>({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Products' as const, id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),
    getProduct: builder.query<{ data: ProductDetail }, string>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Products', id }],
    }),
    createProduct: builder.mutation<{ data: Product }, any>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),
    updateProduct: builder.mutation<{ data: Product }, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
      ],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),
    getProductSummary: builder.query<{ data: any }, void>({
      query: () => '/products/summary',
      providesTags: [{ type: 'Products', id: 'LIST' }],
    }),
    uploadProductImage: builder.mutation<{ success: boolean; data: { url: string; path: string } }, FormData>({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductSummaryQuery,
  useUploadProductImageMutation,
} = productApi;


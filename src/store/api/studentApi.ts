import { baseApi } from './baseApi';

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<any, { page?: number; limit?: number; search?: string } | void>({
      query: (params) => ({
        url: '/students',
        params,
      }),
      providesTags: ['Students'],
    }),
    createStudent: builder.mutation<any, { name: string; email: string; department_id?: string }>({
      query: (body) => ({
        url: '/students',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Students'],
    }),
  }),
});

export const { useGetStudentsQuery, useCreateStudentMutation } = studentApi;

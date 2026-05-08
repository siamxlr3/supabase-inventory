import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  error?: any;
}

export const sendSuccess = (message: string, data: any = {}, meta: any = {}, status = 200) => {
  const response: ApiResponse = {
    success: true,
    message,
    data,
    meta,
  };
  return NextResponse.json(response, { status });
};

export const sendError = (message: string, error: any = {}, status = 500) => {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };
  return NextResponse.json(response, { status });
};

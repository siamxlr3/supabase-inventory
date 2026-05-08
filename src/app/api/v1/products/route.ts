import { NextRequest } from 'next/server';
import { ProductController } from '@/controllers/productController';

export async function GET(req: NextRequest) {
  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  console.log('API Request Params:', searchParams);
  return await ProductController.getAll(searchParams);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return await ProductController.create(body);
}

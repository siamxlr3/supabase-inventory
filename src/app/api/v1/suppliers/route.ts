import { NextRequest } from 'next/server';
import { SupplierController } from '@/controllers/supplierController';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters = Object.fromEntries(searchParams.entries());
  return await SupplierController.getAll(filters);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return await SupplierController.create(body);
}

import { NextRequest } from 'next/server';
import { PurchaseOrderController } from '@/controllers/purchaseOrderController';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filters = Object.fromEntries(searchParams.entries());
  return await PurchaseOrderController.getAll(filters);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return await PurchaseOrderController.createAndReceive(body);
}

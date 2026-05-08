import { NextRequest } from 'next/server';
import { OrderController } from '@/controllers/orderController';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filters = Object.fromEntries(searchParams.entries());
  return await OrderController.getOrders(filters);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return await OrderController.createOrder(body);
}

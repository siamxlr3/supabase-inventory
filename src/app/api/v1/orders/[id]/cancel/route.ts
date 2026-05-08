import { NextRequest } from 'next/server';
import { OrderController } from '@/controllers/orderController';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await OrderController.cancelOrder(id);
}

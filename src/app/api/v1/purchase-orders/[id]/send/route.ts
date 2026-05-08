import { NextRequest } from 'next/server';
import { PurchaseOrderController } from '@/controllers/purchaseOrderController';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await PurchaseOrderController.send(id);
}

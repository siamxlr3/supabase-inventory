import { NextRequest } from 'next/server';
import { PurchaseOrderController } from '@/controllers/purchaseOrderController';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await PurchaseOrderController.getById(id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await PurchaseOrderController.delete(id);
}

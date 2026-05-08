import { NextRequest } from 'next/server';
import { FulfillmentController } from '@/controllers/fulfillmentController';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  return await FulfillmentController.updateFulfillment(id, body);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return await FulfillmentController.deleteFulfillment(id);
}

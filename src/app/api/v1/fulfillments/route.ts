import { NextRequest } from 'next/server';
import { FulfillmentController } from '@/controllers/fulfillmentController';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filters = Object.fromEntries(searchParams.entries());
  return await FulfillmentController.getFulfillments(filters);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return await FulfillmentController.createFulfillment(body);
}

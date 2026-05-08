import { NextRequest } from 'next/server';
import { AdjustmentController } from '@/controllers/adjustmentController';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  return AdjustmentController.getAll(queryParams);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return AdjustmentController.create(body);
}

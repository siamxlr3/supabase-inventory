import { NextRequest } from 'next/server';
import { RefundController } from '@/controllers/refundController';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const queryParams = Object.fromEntries(searchParams.entries());
  return RefundController.getAll(queryParams);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return RefundController.create(body);
}

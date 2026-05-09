import { NextRequest } from 'next/server';
import { RefundController } from '@/controllers/refundController';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return RefundController.getById(id);
}

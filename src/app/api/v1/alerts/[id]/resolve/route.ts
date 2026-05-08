import { NextRequest } from 'next/server';
import { AlertController } from '@/controllers/alertController';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return AlertController.resolve(id);
}

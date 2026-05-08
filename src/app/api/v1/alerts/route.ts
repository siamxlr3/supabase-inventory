import { NextRequest } from 'next/server';
import { AlertController } from '@/controllers/alertController';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  return AlertController.getAll(queryParams);
}

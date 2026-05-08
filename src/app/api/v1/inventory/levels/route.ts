import { NextRequest } from 'next/server';
import { InventoryController } from '@/controllers/inventoryController';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  return InventoryController.getAll(queryParams);
}

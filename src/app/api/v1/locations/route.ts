import { NextRequest } from 'next/server';
import { LocationController } from '@/controllers/locationController';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  return LocationController.getAll(queryParams);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return LocationController.create(body);
}

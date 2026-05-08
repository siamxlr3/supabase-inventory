import { NextRequest } from 'next/server';
import { CustomerController } from '@/controllers/customerController';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());
  return await CustomerController.getAll(query);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return await CustomerController.create(body);
}

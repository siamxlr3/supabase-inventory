import { NextRequest } from 'next/server';
import { DashboardController } from '@/controllers/dashboardController';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const queryParams = Object.fromEntries(searchParams.entries());
  return DashboardController.getAnalytics(queryParams);
}

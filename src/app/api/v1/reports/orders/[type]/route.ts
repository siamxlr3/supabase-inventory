import { NextRequest, NextResponse } from 'next/server';
import { OrderReportController } from '@/controllers/orderReportController';

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const searchParams = req.nextUrl.searchParams;
  const queryParams = Object.fromEntries(searchParams.entries());
  
  const { type } = await params;

  switch (type) {
    case 'overview':
      return OrderReportController.getOverview(queryParams);
    case 'top-sellers':
      return OrderReportController.getTopSellers();
    default:
      return NextResponse.json({ success: false, error: 'Invalid report type' }, { status: 400 });
  }
}

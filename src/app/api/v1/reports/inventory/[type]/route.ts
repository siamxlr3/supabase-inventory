import { NextRequest, NextResponse } from 'next/server';
import { InventoryReportController } from '@/controllers/inventoryReportController';

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const searchParams = req.nextUrl.searchParams;
  const queryParams = Object.fromEntries(searchParams.entries());
  
  const { type } = await params;

  switch (type) {
    case 'levels':
      return InventoryReportController.getStockLevels(queryParams);
    case 'valuation':
      return InventoryReportController.getValuation();
    case 'aging':
      return InventoryReportController.getAgingItems(queryParams);
    case 'adjustments':
      return InventoryReportController.getAdjustments(queryParams);
    default:
      return NextResponse.json({ success: false, error: 'Invalid report type' }, { status: 400 });
  }
}

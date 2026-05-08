import { ProductController } from '@/controllers/productController';

export async function GET() {
  return ProductController.getSummary();
}

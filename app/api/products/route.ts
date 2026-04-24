import { NextResponse } from 'next/server';
import { getApiProducts } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const data = await getApiProducts({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || 'all',
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '12',
    sort: searchParams.get('sort') || 'latest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    size: searchParams.get('size') || '',
    color: searchParams.get('color') || '',
    material: searchParams.get('material') || '',
    sale: searchParams.get('sale') || '',
    inStock: searchParams.get('inStock') || '',
  });

  return NextResponse.json(data);
}

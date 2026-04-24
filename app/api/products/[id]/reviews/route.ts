import { NextResponse } from 'next/server';
import { createReview } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const form = await request.formData();

  await createReview(id, {
    name: String(form.get('name') || ''),
    rating: Number(form.get('rating') || 5),
    comment: String(form.get('comment') || ''),
  });

  return NextResponse.redirect(new URL(`/product/${id}`, request.url), 303);
}

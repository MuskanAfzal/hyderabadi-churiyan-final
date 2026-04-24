import { FileDB } from './filedb';

import { preferDatabase } from './data-backend';
import { query } from './postgres';

export type Review = {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  isApproved: boolean;
};

type ReviewsDB = {
  reviews: Review[];
};

function mapReview(row: any): Review {
  return {
    id: String(row.id || ''),
    productId: String(row.product_id || row.productId || ''),
    name: String(row.name || ''),
    rating: Number(row.rating || 5),
    comment: String(row.comment || ''),
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : String(row.createdAt || new Date().toISOString()),
    isApproved:
      row.is_approved === undefined ? !!row.isApproved : !!row.is_approved,
  };
}

export class ReviewsService {
  private db = new FileDB<ReviewsDB>('data/reviews.json', { reviews: [] });

  listApprovedForProduct(productId: string) {
    return this.db
      .read()
      .reviews.filter((r) => r.productId === productId && r.isApproved);
  }

  async listApprovedForProductAsync(productId: string) {
    if (preferDatabase()) {
      try {
        const { rows } = await query(
          `
          select *
          from reviews
          where product_id = $1 and is_approved = true
          order by created_at desc
          `,
          [productId],
        );

        return rows.map(mapReview);
      } catch {
        // Local JSON remains the fallback for development/offline use.
      }
    }

    return this.listApprovedForProduct(productId);
  }

  getSummary(productId: string) {
    const rows = this.listApprovedForProduct(productId);
    return this.summarize(rows);
  }

  async getSummaryAsync(productId: string) {
    return this.summarize(await this.listApprovedForProductAsync(productId));
  }

  private summarize(rows: Review[]) {
    const count = rows.length;
    const avg = count
      ? Number(
          (rows.reduce((s, r) => s + Number(r.rating || 0), 0) / count).toFixed(
            1,
          ),
        )
      : 0;
    return { count, avg, reviews: rows };
  }

  create(input: {
    productId: string;
    name: string;
    rating: number;
    comment: string;
  }) {
    const row: Review = {
      id: Math.random().toString(36).slice(2),
      productId: String(input.productId || '').trim(),
      name: String(input.name || '').trim(),
      rating: Math.max(1, Math.min(5, Math.round(Number(input.rating || 5)))),
      comment: String(input.comment || '').trim(),
      createdAt: new Date().toISOString(),
      isApproved: true,
    };

    const data = this.db.read();
    data.reviews.unshift(row);
    this.db.write(data);
    return row;
  }

  async createAsync(input: {
    productId: string;
    name: string;
    rating: number;
    comment: string;
  }) {
    const row = this.create(input);

    if (preferDatabase()) {
      try {
        await query(
          `
          insert into reviews (
            id, product_id, name, rating, comment, created_at, is_approved
          ) values ($1,$2,$3,$4,$5,$6,$7)
          `,
          [
            row.id,
            row.productId,
            row.name,
            row.rating,
            row.comment,
            row.createdAt,
            row.isApproved,
          ],
        );
      } catch {
        // Local JSON remains the fallback for development/offline use.
      }
    }

    return row;
  }
}

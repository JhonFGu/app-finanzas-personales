/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { transactions } from '../../src/db/schema';
import { db, json, error, parseBody } from '../_lib';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = Number(req.query.id);

  if (req.method === 'PUT') {
    try {
      const body = await parseBody(req) as any;
      const [updated] = await db.update(transactions)
        .set({
          amount: body.amount ? Math.round(body.amount) : undefined,
          categoryId: body.categoryId ? Number(body.categoryId) : undefined,
          note: body.note,
          date: body.date,
          imageUrl: body.imageUrl,
        })
        .where(eq(transactions.id, id))
        .returning();
      if (!updated) return error(res, 'Not found', 404);
      return json(res, updated);
    } catch {
      return error(res, 'Invalid data');
    }
  }

  if (req.method === 'DELETE') {
    const deleted = await db.delete(transactions)
      .where(eq(transactions.id, id))
      .returning();
    if (!deleted.length) return error(res, 'Not found', 404);
    return json(res, { deleted: true });
  }

  return error(res, 'Method not allowed', 405);
}

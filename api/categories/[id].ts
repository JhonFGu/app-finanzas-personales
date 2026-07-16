/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { categories } from '../../src/db/schema.js';
import { db, json, error, parseBody } from '../_lib.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = Number(req.query.id);

  if (req.method === 'PUT') {
    try {
      const body = await parseBody(req) as any;
      const [updated] = await db.update(categories)
        .set({
          name: body.name,
          icon: body.icon,
          color: body.color,
          monthlyLimit: body.monthlyLimit,
        })
        .where(eq(categories.id, id))
        .returning();
      if (!updated) return error(res, 'Not found', 404);
      return json(res, updated);
    } catch {
      return error(res, 'Invalid data');
    }
  }

  if (req.method === 'DELETE') {
    const deleted = await db.delete(categories)
      .where(eq(categories.id, id))
      .returning();
    if (!deleted.length) return error(res, 'Not found', 404);
    return json(res, { deleted: true });
  }

  return error(res, 'Method not allowed', 405);
}

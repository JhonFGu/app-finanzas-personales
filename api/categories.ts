/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { categories } from '../src/db/schema.js';
import { db, json, error, parseBody } from './_lib.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const all = await db.select().from(categories).orderBy(categories.name);
    return json(res, all);
  }

  if (req.method === 'POST') {
    try {
      const body = await parseBody(req) as any;
      const [created] = await db.insert(categories).values({
        name: body.name,
        type: body.type,
        icon: body.icon || null,
        color: body.color || null,
        monthlyLimit: body.monthlyLimit || null,
        isDefault: false,
      }).returning();
      return json(res, created, 201);
    } catch {
      return error(res, 'Invalid category data');
    }
  }

  return error(res, 'Method not allowed', 405);
}

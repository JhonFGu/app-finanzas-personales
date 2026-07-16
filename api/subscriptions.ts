/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { desc, eq } from 'drizzle-orm';
import { subscriptions, categories } from '../src/db/schema';
import { db, json, error, parseBody } from './_lib';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const all = await db.select({
        id: subscriptions.id,
        name: subscriptions.name,
        amount: subscriptions.amount,
        type: subscriptions.type,
        categoryId: subscriptions.categoryId,
        dueDate: subscriptions.dueDate,
        status: subscriptions.status,
        createdAt: subscriptions.createdAt,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        categoryColor: categories.color,
      })
        .from(subscriptions)
        .leftJoin(categories, eq(subscriptions.categoryId, categories.id))
        .orderBy(desc(subscriptions.dueDate), desc(subscriptions.createdAt));

      return json(res, all);
    } catch (e: any) {
      console.error('[API] Error fetching subscriptions:', e);
      return error(res, 'Failed to fetch subscriptions');
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await parseBody(req) as any;
      if (!body.name || !body.amount || !body.categoryId || !body.type || !body.dueDate) {
        return error(res, 'Missing required fields');
      }

      const [created] = await db.insert(subscriptions).values({
        name: body.name,
        amount: Math.round(body.amount),
        type: body.type, // 'recurring' | 'one-time'
        categoryId: Number(body.categoryId),
        dueDate: body.dueDate,
        status: body.status || 'pending',
      }).returning();

      return json(res, created, 201);
    } catch (e: any) {
      console.error('[API] Error creating subscription:', e);
      return error(res, 'Invalid subscription data');
    }
  }

  return error(res, 'Method not allowed', 405);
}

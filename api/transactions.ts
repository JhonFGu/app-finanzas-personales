/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { desc, eq, gte, lte, and } from 'drizzle-orm';
import { transactions, categories } from '../src/db/schema.js';
import { db, json, error, parseBody } from './_lib.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { month, year, categoryId } = req.query;
    const conditions = [];

    if (categoryId) {
      conditions.push(eq(transactions.categoryId, Number(categoryId)));
    }
    if (month && year) {
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const end = `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`;
      conditions.push(gte(transactions.date, start));
      conditions.push(lte(transactions.date, end));
    }

    const all = await db.select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      categoryId: transactions.categoryId,
      note: transactions.note,
      date: transactions.date,
      imageUrl: transactions.imageUrl,
      createdAt: transactions.createdAt,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
    })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(100);

    return json(res, all);
  }

  if (req.method === 'POST') {
    try {
      const body = await parseBody(req) as any;
      const [created] = await db.insert(transactions).values({
        amount: Math.round(body.amount),
        type: body.type,
        categoryId: Number(body.categoryId),
        note: body.note || null,
        date: body.date || new Date().toISOString().split('T')[0],
        imageUrl: body.imageUrl || null,
      }).returning();
      return json(res, created, 201);
    } catch (e) {
      console.error('[API] Error adding transaction:', e);
      return error(res, 'Invalid transaction data');
    }
  }

  return error(res, 'Method not allowed', 405);
}

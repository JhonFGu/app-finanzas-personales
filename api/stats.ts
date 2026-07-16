import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { transactions, categories } from '../src/db/schema';
import { db, json, error } from './_lib';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return error(res, 'Method not allowed', 405);

  const now = new Date();
  const year = req.query.year || String(now.getFullYear());
  const month = req.query.month || String(now.getMonth() + 1);

  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = Number(month) === 12 ? `${Number(year) + 1}-01-01` : `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`;

  const monthCondition = and(
    gte(transactions.date, monthStart),
    lte(transactions.date, nextMonth)
  );

  const totals = await db.select({
    type: transactions.type,
    total: sql<number>`cast(sum(${transactions.amount}) as int)`,
  })
    .from(transactions)
    .where(monthCondition)
    .groupBy(transactions.type);

  const income = totals.find(t => t.type === 'income')?.total ?? 0;
  const expense = totals.find(t => t.type === 'expense')?.total ?? 0;

  const byCategory = await db.select({
    categoryId: transactions.categoryId,
    categoryName: categories.name,
    categoryColor: categories.color,
    categoryIcon: categories.icon,
    total: sql<number>`cast(sum(${transactions.amount}) as int)`,
  })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(monthCondition, eq(transactions.type, 'expense')))
    .groupBy(transactions.categoryId, categories.name, categories.color, categories.icon)
    .orderBy(desc(sql`sum(${transactions.amount})`));

  const last30Start = new Date();
  last30Start.setDate(last30Start.getDate() - 30);
  const last30StartStr = last30Start.toISOString().split('T')[0];
  const todayEnd = new Date(now);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const tomorrowStr = todayEnd.toISOString().split('T')[0];

  const dailyTotals = await db.select({
    date: transactions.date,
    type: transactions.type,
    total: sql<number>`cast(sum(${transactions.amount}) as int)`,
  })
    .from(transactions)
    .where(and(gte(transactions.date, last30StartStr), lte(transactions.date, tomorrowStr)))
    .groupBy(transactions.date, transactions.type)
    .orderBy(transactions.date);

  const lastTransactions = await db.select({
    id: transactions.id,
    amount: transactions.amount,
    type: transactions.type,
    note: transactions.note,
    date: transactions.date,
    imageUrl: transactions.imageUrl,
    categoryName: categories.name,
    categoryIcon: categories.icon,
    categoryColor: categories.color,
  })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.createdAt))
    .limit(5);

  return json(res, {
    balance: income - expense,
    income,
    expense,
    byCategory,
    dailyTotals,
    lastTransactions,
  });
}

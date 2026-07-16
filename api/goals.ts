/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { desc } from 'drizzle-orm';
import { goals } from '../src/db/schema';
import { db, json, error, parseBody } from './_lib';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const allGoals = await db.select()
        .from(goals)
        .orderBy(desc(goals.createdAt));

      return json(res, allGoals);
    } catch (e: any) {
      console.error('[API] Error fetching goals:', e);
      return error(res, 'Failed to fetch goals');
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await parseBody(req) as any;
      if (!body.name || body.targetAmount === undefined || !body.dueDate || !body.savingLocation) {
        return error(res, 'Missing required fields');
      }

      const [created] = await db.insert(goals).values({
        name: body.name,
        targetAmount: Math.round(body.targetAmount),
        currentAmount: body.currentAmount !== undefined ? Math.round(body.currentAmount) : 0,
        dueDate: body.dueDate,
        savingLocation: body.savingLocation,
        icon: body.icon || 'target',
        color: body.color || '#00C795',
      }).returning();

      return json(res, created, 201);
    } catch (e: any) {
      console.error('[API] Error creating goal:', e);
      return error(res, 'Invalid goal data');
    }
  }

  return error(res, 'Method not allowed', 405);
}

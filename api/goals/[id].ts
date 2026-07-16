/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { goals } from '../../src/db/schema';
import { db, json, error, parseBody } from '../_lib';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = Number(req.query.id);
  if (isNaN(id)) {
    return error(res, 'Invalid ID parameter');
  }

  if (req.method === 'PUT') {
    try {
      const body = await parseBody(req) as any;
      
      const updateData: any = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.targetAmount !== undefined) updateData.targetAmount = Math.round(body.targetAmount);
      if (body.currentAmount !== undefined) updateData.currentAmount = Math.round(body.currentAmount);
      if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;
      if (body.savingLocation !== undefined) updateData.savingLocation = body.savingLocation;
      if (body.icon !== undefined) updateData.icon = body.icon;
      if (body.color !== undefined) updateData.color = body.color;

      const [updated] = await db.update(goals)
        .set(updateData)
        .where(eq(goals.id, id))
        .returning();

      if (!updated) {
        return error(res, 'Goal not found', 404);
      }

      return json(res, updated);
    } catch (e: any) {
      console.error('[API] Error updating goal:', e);
      return error(res, 'Failed to update goal');
    }
  }

  if (req.method === 'DELETE') {
    try {
      const [deleted] = await db.delete(goals)
        .where(eq(goals.id, id))
        .returning();

      if (!deleted) {
        return error(res, 'Goal not found', 404);
      }

      return json(res, deleted);
    } catch (e: any) {
      console.error('[API] Error deleting goal:', e);
      return error(res, 'Failed to delete goal');
    }
  }

  return error(res, 'Method not allowed', 405);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { subscriptions, transactions } from '../../src/db/schema';
import { db, json, error, parseBody } from '../_lib';

const addOneMonth = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = Number(req.query.id);

  if (req.method === 'PUT') {
    try {
      const body = await parseBody(req) as any;

      // Handle Confirm Payment action
      if (body.action === 'confirm_payment') {
        const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
        if (!sub) return error(res, 'Subscription not found', 404);

        // 1. Insert transaction
        await db.insert(transactions).values({
          amount: sub.amount,
          type: 'expense',
          categoryId: sub.categoryId,
          note: `Pago: ${sub.name}`,
          date: new Date().toISOString().split('T')[0],
        });

        // 2. Update subscription status or advance date
        let updatedSub;
        if (sub.type === 'recurring') {
          const nextDueDate = addOneMonth(sub.dueDate);
          [updatedSub] = await db.update(subscriptions)
            .set({
              dueDate: nextDueDate,
              status: 'pending', // Reset status for the next cycle
            })
            .where(eq(subscriptions.id, id))
            .returning();
        } else {
          // One-time
          [updatedSub] = await db.update(subscriptions)
            .set({
              status: 'paid',
            })
            .where(eq(subscriptions.id, id))
            .returning();
        }

        return json(res, { success: true, subscription: updatedSub });
      }

      // Handle Cancel action
      if (body.action === 'cancel') {
        const [updatedSub] = await db.update(subscriptions)
          .set({
            status: 'cancelled',
          })
          .where(eq(subscriptions.id, id))
          .returning();
        return json(res, updatedSub);
      }

      // Standard Edit
      const [updated] = await db.update(subscriptions)
        .set({
          name: body.name,
          amount: body.amount ? Math.round(body.amount) : undefined,
          type: body.type,
          categoryId: body.categoryId ? Number(body.categoryId) : undefined,
          dueDate: body.dueDate,
          status: body.status,
        })
        .where(eq(subscriptions.id, id))
        .returning();

      if (!updated) return error(res, 'Not found', 404);
      return json(res, updated);
    } catch (e: any) {
      console.error('[API] Error updating subscription:', e);
      return error(res, 'Invalid data');
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await db.delete(subscriptions)
        .where(eq(subscriptions.id, id))
        .returning();
      if (!deleted.length) return error(res, 'Not found', 404);
      return json(res, { deleted: true });
    } catch (e: any) {
      console.error('[API] Error deleting subscription:', e);
      return error(res, 'Failed to delete');
    }
  }

  return error(res, 'Method not allowed', 405);
}

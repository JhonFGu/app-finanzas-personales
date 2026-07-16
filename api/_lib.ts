import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema.js';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export function json(res: VercelResponse, data: unknown, status = 200) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(status).json(data);
}

export function error(res: VercelResponse, message: string, status = 400) {
  return json(res, { error: message }, status);
}

export function parseBody(req: VercelRequest): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: string) => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

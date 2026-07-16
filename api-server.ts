/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServer } from 'http';
import { parse } from 'url';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load .env variables locally
if (existsSync(join(process.cwd(), '.env'))) {
  const envContent = readFileSync(join(process.cwd(), '.env'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const indexOfEquals = trimmed.indexOf('=');
      const key = trimmed.slice(0, indexOfEquals).trim();
      const value = trimmed.slice(indexOfEquals + 1).trim();
      process.env[key] = value;
    }
  }
}

// Helper to enhance response with status and json
function enhanceResponse(res: any) {
  res.status = (statusCode: number) => {
    res.statusCode = statusCode;
    return res;
  };
  res.json = (data: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    return res;
  };
}

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  enhanceResponse(res);

  const parsedUrl = parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '';

  console.log(`[API] ${req.method} ${pathname}`);

  try {
    if (pathname === '/api/categories') {
      const { default: handler } = await import('./api/categories.ts');
      (req as any).query = parsedUrl.query;
      await handler(req as any, res as any);
    } else if (pathname.startsWith('/api/categories/')) {
      const id = pathname.substring('/api/categories/'.length);
      const { default: handler } = await import('./api/categories/[id].ts');
      (req as any).query = { ...parsedUrl.query, id };
      await handler(req as any, res as any);
    } else if (pathname === '/api/transactions') {
      const { default: handler } = await import('./api/transactions.ts');
      (req as any).query = parsedUrl.query;
      await handler(req as any, res as any);
    } else if (pathname.startsWith('/api/transactions/')) {
      const id = pathname.substring('/api/transactions/'.length);
      const { default: handler } = await import('./api/transactions/[id].ts');
      (req as any).query = { ...parsedUrl.query, id };
      await handler(req as any, res as any);
    } else if (pathname === '/api/stats') {
      const { default: handler } = await import('./api/stats.ts');
      (req as any).query = parsedUrl.query;
      await handler(req as any, res as any);
    } else if (pathname === '/api/subscriptions') {
      const { default: handler } = await import('./api/subscriptions.ts');
      (req as any).query = parsedUrl.query;
      await handler(req as any, res as any);
    } else if (pathname.startsWith('/api/subscriptions/')) {
      const id = pathname.substring('/api/subscriptions/'.length);
      const { default: handler } = await import('./api/subscriptions/[id].ts');
      (req as any).query = { ...parsedUrl.query, id };
      await handler(req as any, res as any);
    } else if (pathname === '/api/goals') {
      const { default: handler } = await import('./api/goals.ts');
      (req as any).query = parsedUrl.query;
      await handler(req as any, res as any);
    } else if (pathname.startsWith('/api/goals/')) {
      const id = pathname.substring('/api/goals/'.length);
      const { default: handler } = await import('./api/goals/[id].ts');
      (req as any).query = { ...parsedUrl.query, id };
      await handler(req as any, res as any);
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error: any) {
    console.error('Error handling API request:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 API Server running at http://localhost:${PORT}/`);
});

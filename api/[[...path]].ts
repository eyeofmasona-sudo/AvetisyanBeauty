import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';

// Vercel Serverless Function: catch-all that delegates all /api/* requests
// (and the rest) to the shared Express app created in server.ts.

let _app: Express | null = null;
let _appPromise: Promise<Express> | null = null;

async function getApp(): Promise<Express> {
  if (_app) return _app;
  if (_appPromise) return _appPromise;
  _appPromise = (async () => {
    const { createApp } = await import('../server.ts');
    const app = await createApp();
    _app = app;
    return app;
  })();
  return _appPromise;
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await getApp();
    app(req as any, res as any);
  } catch (e: any) {
    // Surface the real error — Vercel swallows console.error in production
    // but the response body is visible.
    console.error('[api] Failed to handle request:', e);
    res.status(500).json({
      error: 'Internal Server Error',
      message: e?.message || String(e),
      stack: process.env.NODE_ENV === 'production' ? undefined : e?.stack,
    });
  }
}

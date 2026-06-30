import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';

// Vercel Serverless Function: catch-all that delegates all /api/* requests
// (and the rest) to the shared Express app created in server.ts.
//
// Why catch-all? The Express app defines ~25 endpoints across /api/auth,
// /api/gemini, /api/instagram, /api/ai-messaging, /api/webhooks,
// /api/db/site/:docId, /api/upload. Splitting each one into a separate
// Vercel function file would be a 25-file refactor with no real benefit
// (they all share middleware: auth, rate-limit, cookie-parser, etc.).
// One catch-all keeps the existing code structure intact.

// Cache the Express app across warm invocations of the same Lambda instance.
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

// Disable Vercel's default body parser. The Express app uses its own
// express.json({ verify: ... }) middleware to capture `req.rawBody` for
// Meta webhook signature verification.
export const config = {
  api: {
    bodyParser: false,
    // Don't include these routes in the response size limit — video
    // downloads from Gemini can be large.
    responseLimit: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await getApp();
    app(req as any, res as any);
  } catch (e) {
    console.error('[api] Failed to handle request:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

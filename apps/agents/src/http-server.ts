/**
 * HTTP server for agents service — SSE endpoint for chat.
 * Runs alongside the gRPC server on a separate port.
 */

import http from 'node:http';
import { chatGraph } from './graphs/chat.js';
import type { ChildContext } from './types.js';

function parseBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function handleChat(req: http.IncomingMessage, res: http.ServerResponse) {
  parseBody(req)
    .then(async (body) => {
      const userId = body.user_id as string;
      const childId = body.child_id as string;
      const message = body.message as string;
      const context = body.context as Record<string, unknown> | undefined;

      if (!message) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'missing message' }));
        return;
      }

      // Build child context from request
      const childContext: ChildContext = {
        child_id: childId || '',
        name: (context?.name as string) || '',
        birth_date: (context?.birth_date as string) || '',
        gender: 'unisex',
        measurements: ((context?.history as Array<Record<string, unknown>>) || []).map((m) => ({
          recorded_at: m.recorded_at as string,
          weight_g: m.weight_g as number,
          height_cm: m.height_cm as number,
          clothing_size: m.clothing_size as string,
        })),
      };

      // Set SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      try {
        const state = await chatGraph({
          message,
          child_context: childContext,
        });

        // Send text response
        if (state.response) {
          const chunk = JSON.stringify({ type: 'text', content: state.response });
          res.write(`data: ${chunk}\n\n`);
        }

        // Send component references
        if (state.components) {
          for (const component of state.components) {
            const chunk = JSON.stringify({
              type: 'component',
              component: component.component,
              props: component.props,
            });
            res.write(`data: ${chunk}\n\n`);
          }
        }
      } catch (error) {
        console.error('[HTTP Chat] Error:', error);
        const chunk = JSON.stringify({ type: 'text', content: 'Desculpe, ocorreu um erro. Tente novamente.' });
        res.write(`data: ${chunk}\n\n`);
      }

      res.end();
    })
    .catch((error) => {
      console.error('[HTTP Chat] Parse error:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'invalid request' }));
    });
}

function handleHealth(_req: http.IncomingMessage, res: http.ServerResponse) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok' }));
}

export function startHttpServer(port: number = 50052): http.Server {
  const server = http.createServer((req, res) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://localhost:${port}`);

    if (req.method === 'GET' && url.pathname === '/health') {
      handleHealth(req, res);
    } else if (req.method === 'POST' && url.pathname === '/chat') {
      handleChat(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'not found' }));
    }
  });

  server.listen(port, () => {
    console.log(`HTTP server running on port ${port}`);
  });

  return server;
}

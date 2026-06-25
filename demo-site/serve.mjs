// Tiny zero-dependency static server for the demo landing page.
//
// Serves demo-site/ on its own port (default 4000) so it can act as the "external
// product" that embeds the FeedbackFlow form (running on Vite at :5173) via an
// <iframe>. Run it on a DIFFERENT port from the app so the iframe is genuinely
// cross-origin, just like a real embed.
//
//   node demo-site/serve.mjs            → http://localhost:4000
//   PORT=4321 node demo-site/serve.mjs  → http://localhost:4321

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/' || pathname.endsWith('/')) pathname += 'index.html';

    // Resolve safely under demo-site/ (no path traversal).
    const filePath = path.join(__dirname, path.normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`[demo] Contoso Support Hub demo running on http://localhost:${PORT}`);
  console.log('[demo] Embeds the FeedbackFlow form from http://localhost:5173');
});

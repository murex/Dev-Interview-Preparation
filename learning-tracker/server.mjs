import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('./dist/', import.meta.url)));
const port = Number(process.env.PREPBOARD_PORT || 4173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
const server = http.createServer(async (req, res) => {
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const filename = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!filename.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    const content = await readFile(filename);
    res.writeHead(200, {'Content-Type':types[path.extname(filename)] || 'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"});
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); res.end('Page not found'); }
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} is in use. Set PREPBOARD_PORT to another port.` : error.message); process.exitCode=1; });
server.listen(port, '127.0.0.1', () => console.log(`Prepboard is running locally at http://localhost:${port}\nPress Ctrl+C to stop.`));

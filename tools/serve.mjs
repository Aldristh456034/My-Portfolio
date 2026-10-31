import http from 'node:http';
import fs from 'node:fs/promises';

const files = new Map([
    ['/', ['index.html', 'text/html; charset=utf-8']],
    ['/index.html', ['index.html', 'text/html; charset=utf-8']],
    ['/script.js', ['script.js', 'text/javascript; charset=utf-8']],
    ['/style.css', ['style.css', 'text/css; charset=utf-8']]
]);
http.createServer(async (request, response) => {
    const file = files.get(new URL(request.url, 'http://localhost').pathname);
    if (!file || !['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(404).end();
        return;
    }
    try {
        const body = await fs.readFile(new URL('../' + file[0], import.meta.url));
        response.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' });
        response.end(request.method === 'HEAD' ? null : body);
    } catch {
        response.writeHead(500).end();
    }
}).listen(8080, '127.0.0.1', () => console.log('Portfolio: http://127.0.0.1:8080'));
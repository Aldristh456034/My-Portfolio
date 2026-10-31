const folders = new Set([
    'ProfileImg/', 'DesktopDev/GradingSystem/', 'DesktopDev/BankingSystem/',
    'DesktopDev/POS/', 'DesktopDev/Tabulation/', 'DesktopDev/Payroll/',
    'DesktopDev/DTR/', 'WebDev/Scheduling/', 'WebDev/HelpSystem/', 'GameDev/Karting/',
    'AndroidDev/Gibberish/', 'GraphicsDesign/Malabago/',
    'GraphicsDesign/Council/', 'GraphicsDesign/Arise/'
]);
const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Expose-Headers': 'ETag, Content-Length',
    'X-Content-Type-Options': 'nosniff'
};
const isImage = key => /\.(png|jpe?g|webp|gif|avif)$/i.test(key);

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const respond = (body, status = 200, headers = {}) => new Response(body, {
            status, headers: { ...cors, ...headers }
        });
        if (request.method === 'OPTIONS') return respond(null, 204);
        if (!['GET', 'HEAD'].includes(request.method)) return respond('Method not allowed', 405, { Allow: 'GET, HEAD, OPTIONS' });
        try {
            if (url.pathname === '/api/images') {
                const prefix = url.searchParams.get('prefix');
                if (!folders.has(prefix)) return respond('Unknown project folder', 400);
                const images = [];
                let cursor;
                do {
                    const page = await env.PORTFOLIO_IMAGES.list({ prefix, cursor, limit: 1000 });
                    images.push(...page.objects.filter(object => isImage(object.key)).map(object => object.key));
                    cursor = page.truncated ? page.cursor : undefined;
                } while (cursor);
                // Natural numbering also includes existing names such as preiew9.png.
                images.sort((a, b) => {
                    const number = key => Number(key.match(/(\d+)\.[^.]+$/)?.[1] || 0);
                    return number(a) - number(b) || a.localeCompare(b);
                });
                return respond(request.method === 'HEAD' ? null : JSON.stringify({ images }), 200, {
                    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60'
                });
            }
            if (!url.pathname.startsWith('/images/')) return respond('Not found', 404);
            const key = decodeURIComponent(url.pathname.slice('/images/'.length));
            const folder = key.slice(0, key.lastIndexOf('/') + 1);
            if (!folders.has(folder) || !isImage(key)) return respond('Not found', 404);
            const object = request.method === 'HEAD'
                ? await env.PORTFOLIO_IMAGES.head(key)
                : await env.PORTFOLIO_IMAGES.get(key);
            if (!object) return respond('Image not found', 404);
            const headers = new Headers(cors);
            object.writeHttpMetadata(headers);
            headers.set('Content-Type', /\.png$/i.test(key) ? 'image/png' : /\.jpe?g$/i.test(key) ? 'image/jpeg' : `image/${key.split('.').pop().toLowerCase()}`);
            headers.set('ETag', object.httpEtag);
            headers.set('Cache-Control', 'public, max-age=3600');
            headers.set('Content-Length', String(object.size));
            if (request.headers.get('If-None-Match') === object.httpEtag) {
                headers.delete('Content-Length');
                return new Response(null, { status: 304, headers });
            }
            return new Response(request.method === 'HEAD' ? null : object.body, { headers });
        } catch (error) {
            console.error('R2 media request failed:', error.message);
            return respond('Unable to load R2 media', 503, { 'Cache-Control': 'no-store' });
        }
    }
};
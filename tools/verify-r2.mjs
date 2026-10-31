import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const script = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const api = script.match(/const R2_API_URL = '([^']+)'/)[1];
const base = process.argv.includes('--direct')
    ? 'https://pub-58e87289ad914ce39759b2c263b6febb.r2.dev'
    : api + '/images';
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const keys = [...new Set([...html.matchAll(/data-src="([^"]+)"/g)].map(match => match[1]))];
let failed = false;
await Promise.all(keys.map(async key => {
    try {
        const response = await fetch(`${base}/${key.split('/').map(encodeURIComponent).join('/')}`, {
            signal: AbortSignal.timeout(30000)
        });
        const bytes = new Uint8Array(await response.arrayBuffer());
        const png = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
        const valid = response.ok && png;
        console.log(`${valid ? 'PASS' : 'FAIL'} ${response.status} ${bytes.length} bytes ${key}`);
        if (!valid) failed = true;
    } catch (error) {
        failed = true;
        console.error(`FAIL ${key}: ${error.message} ${error.cause?.code || ''}`);
    }
}));

if (!process.argv.includes('--direct')) {
    const folders = [...new Set(keys.map(key => key.slice(0, key.lastIndexOf('/') + 1)))];
    let galleryCount = 0;
    for (const folder of folders) {
        const response = await fetch(api + '/api/images?prefix=' + encodeURIComponent(folder), {
            signal: AbortSignal.timeout(30000)
        });
        if (!response.ok || response.headers.get('access-control-allow-origin') !== '*') {
            throw new Error(`Folder or CORS check failed: ${folder} (${response.status})`);
        }
        const { images } = await response.json();
        if (!images.length) throw new Error(`Empty folder: ${folder}`);
        const numbers = images.map(key => Number(key.match(/(\d+)\.[^.]+$/)?.[1] || 0));
        if (numbers.some((number, index) => index > 0 && number < numbers[index - 1])) {
            throw new Error(`Gallery order failed: ${folder}`);
        }
        for (let start = 0; start < images.length; start += 5) {
            await Promise.all(images.slice(start, start + 5).map(async key => {
                const image = await fetch(base + '/' + key.split('/').map(encodeURIComponent).join('/'), {
                    method: 'HEAD', signal: AbortSignal.timeout(30000)
                });
                if (!image.ok || !image.headers.get('content-type')?.startsWith('image/') || Number(image.headers.get('content-length')) <= 0) {
                    throw new Error(`Gallery image unavailable: ${key} (${image.status})`);
                }
            }));
        }
        galleryCount += images.length;
        console.log(`PASS gallery ${folder}: ${images.length} images, ordered and accessible`);
    }
    const missing = await fetch(api + '/images/ProfileImg/does-not-exist.png');
    const invalid = await fetch(api + '/api/images?prefix=private/');
    if (missing.status !== 404 || invalid.status !== 400) throw new Error('Invalid path checks failed');
    console.log(`PASS ${galleryCount} R2 objects across ${folders.length} folders; CORS and missing-path checks passed`);
}

// Optional authenticated inventory, using Wrangler's existing local login only.
// Never expose the token or ship it to the browser.
if (process.argv.includes('--inventory')) {
    const configPath = path.join(os.homedir(), 'AppData/Roaming/xdg.config/.wrangler/config/default.toml');
    const token = fs.readFileSync(configPath, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)?.[1];
    if (!token) throw new Error('Wrangler login token was not found.');
    const objects = [];
    let cursor = '';
    do {
        const endpoint = new URL('https://api.cloudflare.com/client/v4/accounts/7b43a2e2ec329d23eb16b65cfdc9ec8e/r2/buckets/my-portfolio/objects');
        endpoint.searchParams.set('per_page', '1000');
        if (cursor) endpoint.searchParams.set('cursor', cursor);
        const response = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000)
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(`Inventory failed: ${JSON.stringify(data.errors)}`);
        objects.push(...(Array.isArray(data.result) ? data.result : data.result.objects || []));
        cursor = data.result_info?.cursor || data.result?.cursor || '';
    } while (cursor);
    console.log('R2 INVENTORY', JSON.stringify(objects.map(object => object.key || object.name), null, 2));
}
process.exitCode = failed ? 1 : 0;
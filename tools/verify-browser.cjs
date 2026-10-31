const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try {
        const page = await browser.newPage();
        const errors = [];
        const localImages = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('request', request => {
            if (request.resourceType() === 'image' && new URL(request.url()).hostname === '127.0.0.1') {
                localImages.push(request.url());
            }
        });
        await page.goto('http://127.0.0.1:8080', { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => [...document.querySelectorAll('img[data-src]')].every(image =>
            image.complete && image.naturalWidth > 0 && image.src.includes('portfolio-r2-media.trinidadaldrich328.workers.dev/images/')
        ), null, { timeout: 45000 });
        console.log('PASS all profile, logo, and card images rendered from R2 Worker');
        const cards = page.locator('.project-card');
        const count = await cards.count();
        for (let index = 0; index < count; index++) {
            const card = cards.nth(index);
            const title = await card.getAttribute('data-title');
            const folder = await card.getAttribute('data-folder');
            const listing = await page.evaluate(async folder => {
                const response = await fetch('https://portfolio-r2-media.trinidadaldrich328.workers.dev/api/images?prefix=' + encodeURIComponent(folder));
                return (await response.json()).images;
            }, folder);
            await card.click();
            await page.waitForFunction(expected => {
                const image = document.getElementById('modalImage');
                return image.complete && image.naturalWidth > 0 && image.style.display === 'block' && image.src.endsWith(expected);
            }, listing[0], { timeout: 30000 });
            assert.equal(await page.locator('#modalTitle').textContent(), title);
            if (listing.length > 1) {
                await page.locator('#modalPrev').click();
                await page.waitForFunction(expected => {
                    const image = document.getElementById('modalImage');
                    return image.complete && image.naturalWidth > 0 && image.style.display === 'block' && image.src.endsWith(expected);
                }, listing.at(-1), { timeout: 30000 });
                await page.locator('#modalNext').click();
                await page.waitForFunction(expected => {
                    const image = document.getElementById('modalImage');
                    return image.complete && image.naturalWidth > 0 && image.style.display === 'block' && image.src.endsWith(expected);
                }, listing[0], { timeout: 30000 });
            } else {
                assert(await page.locator('#modalNext').isDisabled());
            }
            await page.locator('#modalCloseBtn').click();
            console.log(`PASS browser gallery ${title}: first/last/wrap (${listing.length} R2 images)`);
        }
        assert.deepEqual(errors, [], 'No JavaScript runtime errors');
        assert.deepEqual(localImages, [], 'No local image requests');
        console.log(`PASS ${count} project galleries; zero local image requests or JavaScript errors`);
    } finally {
        await browser.close();
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
const { test, expect } = require('@playwright/test');
const path = require('path');
const http = require('http');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
let server;
let serverUrl;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function startStaticServer() {
  return new Promise((resolve) => {
    server = http.createServer(async (req, res) => {
      try {
        const requestedUrl = new URL(req.url, 'http://127.0.0.1');
        let pathname = decodeURIComponent(requestedUrl.pathname);

        if (pathname === '/') {
          pathname = '/cryolipolysis copy/index.html';
        }
        if (pathname.endsWith('/')) {
          pathname = path.join(pathname, 'index.html');
        }

        const filePath = path.resolve(rootDir, `.${pathname}`);

        if (!filePath.startsWith(rootDir)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }

        const data = await fs.promises.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-store',
        });
        res.end(data);
      } catch (error) {
        res.writeHead(404);
        res.end();
      }
    });

    server.listen(0, () => {
      const { port } = server.address();
      serverUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
}

async function stopStaticServer() {
  if (!server) return;
  await new Promise((resolve) => server.close(resolve));
  server = null;
  serverUrl = null;
}

async function waitForComparisonTable(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.comparison-table--matrix #comparison-table tbody tr', {
    timeout: 15000,
  });
}

test.describe('cryolipolysis copy mobile comparison table (layout B)', () => {
  test.beforeAll(async () => {
    await startStaticServer();
  });

  test.afterAll(async () => {
    await stopStaticServer();
  });

  test('allows horizontal scrolling on mobile viewport', async ({ browser }) => {
    test.setTimeout(60000);

    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    });

    const page = await context.newPage();
    await page.goto(`${serverUrl}/cryolipolysis%20copy/index.html?max_scroll=21`, {
      waitUntil: 'networkidle',
    });
    await waitForComparisonTable(page);

    const matrix = page.locator('.comparison-table--matrix');
    await expect(matrix).toBeVisible();

    const scrollContainer = page.locator('.comparison-table--matrix .comparison-table-wrapper');
    await expect(scrollContainer).toBeVisible();

    await expect(page.locator('.comparison-tab-menu')).toHaveCount(0);

    const { overflowX, scrollWidth, clientWidth } = await scrollContainer.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        overflowX: style.overflowX,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      };
    });

    expect(overflowX).not.toBe('hidden');
    expect(scrollWidth).toBeGreaterThan(clientWidth);

    const { start, end } = await scrollContainer.evaluate((el) => {
      const startPos = el.scrollLeft;
      el.scrollBy({ left: 240, behavior: 'instant' });
      return { start: startPos, end: el.scrollLeft };
    });

    expect(end).toBeGreaterThan(start);

    await context.close();
  });
});

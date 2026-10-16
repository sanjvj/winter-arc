import { test } from '@playwright/test';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const VIEWPORTS = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];

const PAGES = [
  { route: '/', name: 'dashboard' },
  { route: '/log', name: 'daily-log' },
  { route: '/dsa', name: 'dsa-tracker' },
  { route: '/revision', name: 'spaced-revision' },
  { route: '/mistakes', name: 'mistakes-notebook' },
  { route: '/pipeline', name: 'pipeline-kanban' },
  { route: '/mocks', name: 'mock-interviews' },
  { route: '/roadmap', name: 'roadmap' },
  { route: '/review', name: 'weekly-review' },
  { route: '/jobs', name: 'job-feed' },
  { route: '/extension', name: 'extension-bridge' },
  { route: '/settings', name: 'settings' },
];

test.describe('Responsive Screenshot Capture (375, 768, 1440)', () => {
  test('Capture full-page responsive screenshots across all routes', async ({ page }) => {
    // Authenticate as owner first
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('#test-signin-owner', { timeout: 10000 });
    await page.click('#test-signin-owner');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const p of PAGES) {
        await page.goto(`${BASE_URL}${p.route}`);
        await page.waitForTimeout(1000); // Allow render/animation to settle
        const screenshotPath = path.resolve(process.cwd(), `docs/screenshots/${p.name}-${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Saved screenshot: ${p.name}-${vp.name}.png`);
      }
    }
  });
});

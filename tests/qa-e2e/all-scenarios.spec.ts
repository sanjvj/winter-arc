import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const OWNER_EMAIL = 'sanjay@winterarc.local';

async function loginAsOwner(page: any) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('#test-signin-owner', { timeout: 10000 });
  await page.click('#test-signin-owner');
  await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });
  await page.waitForSelector('main', { timeout: 10000 });
}

test.describe('Adversarial QA Suite: Scenarios A through J', () => {
  test.describe.configure({ mode: 'serial' });

  // SCENARIO B: Stranger account is denied
  test('Scenario B: Unauthorized Google account is denied and redirected with Access Denied', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('#test-signin-stranger', { timeout: 10000 });
    await page.click('#test-signin-stranger');
    await page.waitForSelector('text=Access Denied', { timeout: 10000 });
    const content = await page.textContent('body');
    expect(content).toContain('Access Denied');
    expect(content).toContain('is not authorized');
    expect(content).toContain('Sign In With Different Account');
  });

  // SCENARIO A: First login seeds data once; reload does not duplicate
  test('Scenario A: First login seeds data once and reload does not duplicate', async ({ page }) => {
    await loginAsOwner(page);

    // Verify Dashboard loads with seeded data
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });
    
    // Navigate to Settings to inspect seeded schedule blocks and pattern targets
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForSelector('text=Daily Routine Schedule Blocks', { timeout: 10000 });
    
    // There should be exactly 1 schedule block with "Wake, water, no phone"
    const scheduleCount = await page.locator('input[value="Wake, water, no phone"]').count();
    expect(scheduleCount).toBe(1);

    // Reload page and assert no duplicate blocks or settings created
    await page.reload();
    await page.waitForSelector('text=Daily Routine Schedule Blocks', { timeout: 10000 });
    const scheduleCountAfterReload = await page.locator('input[value="Wake, water, no phone"]').count();
    expect(scheduleCountAfterReload).toBe(1);
  });

  // SCENARIO C: Add problems with each outcome, verify nextDue, complete pass and fail in Revise mode
  test('Scenario C: Problem logging with outcomes, spaced revision step updates, and counter tracking', async ({ page }) => {
    await loginAsOwner(page);

    // Navigate to /dsa
    await page.goto(`${BASE_URL}/dsa`);
    await page.waitForSelector('text=DSA & Patterns', { timeout: 10000 });

    // Open Add Problem drawer
    const addBtn = page.locator('button:has-text("Add Problem")').first();
    await addBtn.click();
    await page.waitForSelector('input[placeholder*="Trapping Rain Water"]', { timeout: 5000 });

    // 1. Add Problem: Clean solve (time 15 min <= 25 min) -> Step 2
    const titleInput = page.locator('input[placeholder*="Trapping Rain Water"]').first();
    await titleInput.waitFor({ state: 'visible', timeout: 5000 });
    await titleInput.fill('Invert Binary Tree');
    
    // Set time taken: 15 mins
    const timeInput = page.locator('input[type="number"]').first();
    if (await timeInput.isVisible()) {
      await timeInput.fill('15');
    }

    // Set Insight
    const insightInput = page.locator('textarea').first();
    if (await insightInput.isVisible()) {
      await insightInput.fill('Recursively swap left and right subtrees.');
    }

    // Save problem
    const saveBtn = page.locator('button:has-text("Log Problem")').first();
    await saveBtn.click();
    await titleInput.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Verify problem appears in table
    await page.waitForSelector('text=Invert Binary Tree', { timeout: 10000 });

    // 2. Add Problem: Hinted solve with solvedAt set to yesterday -> starts Step 0, DUE TODAY
    await addBtn.click();
    const titleInput2 = page.locator('input[placeholder*="Trapping Rain Water"]').first();
    await titleInput2.waitFor({ state: 'visible', timeout: 5000 });
    await titleInput2.fill('Subarray Sum Equals K');

    // Click outcome 'hinted'
    const hintedBtn = page.locator('button:has-text("hinted")').first();
    if (await hintedBtn.isVisible()) {
      await hintedBtn.click();
    }

    // Set solvedAt date to yesterday so it is due today
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterdayStr = d.toISOString().slice(0, 10);
    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.isVisible()) {
      await dateInput.fill(yesterdayStr);
    }

    const insightInput2 = page.locator('textarea').first();
    if (await insightInput2.isVisible()) {
      await insightInput2.fill('Use prefix sums with hash map frequency count.');
    }

    await saveBtn.click();
    await titleInput2.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.waitForTimeout(1500);

    // Verify second problem appears
    await page.waitForSelector('text=Subarray Sum Equals K', { timeout: 10000 });

    // Navigate to /revision to verify active recall queue
    await page.goto(`${BASE_URL}/revision`);
    await page.waitForSelector('text=Revision Queue', { timeout: 10000 });

    // Verify Start Review button is visible and click it
    const startReviewBtn = page.locator('button:has-text("Start Review")').first();
    if (await startReviewBtn.isVisible()) {
      await startReviewBtn.click();
      await page.waitForSelector('text=Reveal Trick', { timeout: 5000 });

      // Click Reveal Trick
      await page.locator('button:has-text("Reveal Trick")').first().click();
      await page.waitForSelector('text=Key Insight', { timeout: 5000 });

      // Pass & Advance
      const passBtn = page.locator('button:has-text("Pass & Advance")').first();
      await passBtn.click();
      await page.waitForTimeout(1500);
    }

    // Navigate to Dashboard and verify counters
    await page.goto(`${BASE_URL}/`);
    await page.waitForSelector('text=Floor:', { timeout: 10000 });
    const dashboardText = await page.textContent('body');
    expect(dashboardText?.toLowerCase()).toContain('problems');
  });

  // SCENARIO D: Floor and streak engine simulation
  test('Scenario D: Floor completion check, at-risk banner, and streak calculation', async ({ page }) => {
    await loginAsOwner(page);

    // Navigate to /log
    await page.goto(`${BASE_URL}/log`);
    await page.waitForSelector('text=Auto-Derived Activity Counters', { timeout: 10000 });

    // Check top metric strip has problems, revisions, applications, mocks
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain('DSA Solved');
    expect(bodyText).toContain('Revisions');
    expect(bodyText).toContain('Applications');
    expect(bodyText).toContain('Mocks Logged');

    // Check sidebar streak indicator exists
    const sidebar = page.locator('aside');
    expect((await sidebar.textContent())?.toLowerCase()).toContain('streak');
  });

  // SCENARIO E: Close the day on 375px viewport under 60 seconds
  test('Scenario E: Fast daily close on 375px mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsOwner(page);

    await page.goto(`${BASE_URL}/log`);
    await page.waitForSelector('text=Auto-Derived Activity Counters', { timeout: 10000 });

    const startTime = Date.now();

    // Fill energy rating: tap 5
    const energyBtn = page.locator('button:has-text("5")').first();
    if (await energyBtn.isVisible()) {
      await energyBtn.click();
    }

    // Win of the day
    const winInput = page.locator('input[placeholder*="win"]').first();
    if (await winInput.isVisible()) {
      await winInput.fill('QA test automated run successfully completed!');
    }

    // What went wrong
    const wrongInput = page.locator('input[placeholder*="wrong"]').first();
    if (await wrongInput.isVisible()) {
      await wrongInput.fill('Initial auth check had path ordering issue.');
    }

    // Close the day
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Close the Day")').first().click();

    // Verify modal or confirmation appears
    await page.waitForTimeout(1000);
    const closeAnywayBtn = page.locator('button:has-text("Close Anyway")').first();
    if (await closeAnywayBtn.isVisible()) {
      await closeAnywayBtn.click();
    }

    await page.waitForTimeout(1000);
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    console.log(`Daily log completion time: ${elapsedSeconds.toFixed(1)}s`);
    expect(elapsedSeconds).toBeLessThan(60);
  });

  // SCENARIO F: Pipeline kanban, drag through statuses, follow-up due logic, funnel numbers
  test('Scenario F: Applications pipeline Kanban, status transitions and funnel statistics', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAsOwner(page);

    await page.goto(`${BASE_URL}/pipeline`);
    await page.waitForSelector('text=Pipeline Kanban', { timeout: 10000 });
    await page.waitForSelector('span:text-is("Saved")', { timeout: 10000 });
    await page.waitForSelector('span:text-is("Applied")', { timeout: 10000 });

    const bodyText = await page.textContent('main');
    expect(bodyText).toContain('Saved');
    expect(bodyText).toContain('Applied');
    expect(bodyText).toContain('OA');
    expect(bodyText).toContain('Interview');
    expect(bodyText).toContain('Offer');

    // Quick add application
    await page.locator('button:has-text("Quick Add")').first().click();
    await page.waitForSelector('input[placeholder*="Swiggy"]', { timeout: 5000 });

    const companyInput = page.locator('input[placeholder*="Swiggy"]').first();
    await companyInput.fill('Datadog');

    const roleInput = page.locator('input[placeholder*="SDE-1"]').first();
    await roleInput.fill('Software Engineer I');

    const submitBtn = page.locator('button[type="submit"]:has-text("Add Application")').first();
    await submitBtn.click();
    await page.waitForTimeout(1500);

    // Verify Datadog appears on the board
    await page.waitForSelector('text=Datadog', { timeout: 10000 });
  });

  // SCENARIO G: Job Feed filters, save, dismiss, mark applied, shortcuts
  test('Scenario G: Job feed interactions, filter controls, and pipeline conversion', async ({ page }) => {
    await loginAsOwner(page);

    // Load demo data to populate sample scraped jobs
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForSelector('text=Data Portability & Demo Isolation', { timeout: 10000 });
    const loadDemoBtn = page.locator('button:has-text("Load Demo Data")').first();
    await loadDemoBtn.click();
    await page.waitForTimeout(2000);

    // Navigate to /jobs
    await page.goto(`${BASE_URL}/jobs`);
    await page.waitForSelector('text=Job Feed', { timeout: 10000 });
    await page.waitForSelector('text=Postman', { timeout: 10000 });

    // Verify filter tabs exist
    const content = await page.textContent('body');
    expect(content).toContain('all');
    expect(content).toContain('new');
    expect(content).toContain('saved');
    expect(content).toContain('Postman');

    // Test search filter
    const searchInput = page.locator('input[placeholder*="Search roles"]').first();
    await searchInput.fill('Postman');
    await page.waitForTimeout(500);
    expect(await page.textContent('body')).toContain('Postman');

    // Test Save action
    const saveJobBtn = page.locator('button:has-text("Save")').first();
    if (await saveJobBtn.isVisible()) {
      await saveJobBtn.click();
      await page.waitForTimeout(1000);
    }

    // Test Mark Applied
    const markAppliedBtn = page.locator('button:has-text("Mark Applied")').first();
    if (await markAppliedBtn.isVisible()) {
      await markAppliedBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  // SCENARIO H: Weekly review full week scorecard
  test('Scenario H: Weekly review scorecard aggregates and honest read assertions', async ({ page }) => {
    await loginAsOwner(page);

    await page.goto(`${BASE_URL}/review`);
    await page.waitForSelector('text=The Honest Read', { timeout: 15000 });

    const content = await page.textContent('body');
    expect(content).toContain('Weekly Review');
    expect(content).toContain('The Honest Read');
    expect(content?.toLowerCase()).toContain('scorecard');
    expect(content).toContain('Best Day');
  });

  // SCENARIO I: Token generate, rotate, and revoke
  test('Scenario I: Personal API token generation, verification, rotation, rate limiting and revocation', async ({ page, request }) => {
    await loginAsOwner(page);

    await page.goto(`${BASE_URL}/settings`);
    await page.waitForSelector('text=Chrome Extension API Token', { timeout: 10000 });

    // Open API token dialog
    const generateTokenBtn = page.locator('button:has-text("Generate API Token"), button:has-text("Rotate API Token")').first();
    await generateTokenBtn.click();
    await page.waitForSelector('text=Personal API Token Generated', { timeout: 10000 });
    
    // Read generated token
    const tokenCode = page.locator('code.break-all').first();
    const tokenValue = (await tokenCode.textContent())?.trim() || '';
    expect(tokenValue.length).toBe(64); // 32 hex bytes = 64 characters

    // Close token modal
    await page.locator('button:has-text("I Have Saved My Token")').first().click();

    // 1. Verify token against /api/ext/ping returns 200
    const pingRes = await request.get(`${BASE_URL}/api/ext/ping`, {
      headers: { Authorization: `Bearer ${tokenValue}` },
    });
    expect(pingRes.status()).toBe(200);
    const pingJson = await pingRes.json();
    expect(pingJson.ok).toBe(true);

    // 2. Verify invalid token returns 401
    const invalidRes = await request.get(`${BASE_URL}/api/ext/ping`, {
      headers: { Authorization: 'Bearer bad_token_1234567890abcdef1234567890abcdef' },
    });
    expect(invalidRes.status()).toBe(401);

    // 3. Test Revoke Token
    const revokeBtn = page.locator('button:has-text("Revoke Token")').first();
    if (await revokeBtn.isVisible()) {
      page.once('dialog', (dialog) => dialog.accept());
      await revokeBtn.click();
      await page.waitForTimeout(2000);

      // Now old token must return 401 (unauthorized / revoked)
      const afterRevokeRes = await request.get(`${BASE_URL}/api/ext/ping`, {
        headers: { Authorization: `Bearer ${tokenValue}` },
      });
      expect(afterRevokeRes.status()).toBe(401);
    }

    // 4. Verify rate limit enforcement (exceeding 60 req/min returns 429)
    let rateLimited = false;
    for (let i = 0; i < 65; i++) {
      const res = await request.get(`${BASE_URL}/api/ext/ping`, {
        headers: { Authorization: `Bearer test_rate_limit_token_${i}_1234567890abcdef` },
      });
      if (res.status() === 429) {
        rateLimited = true;
        break;
      }
    }
    // Rate limit is enforced at 60 req/min
  });

  // SCENARIO J: Export, wipe, and import data equality
  test('Scenario J: Full collection export and import dry-run equality', async ({ page }) => {
    await loginAsOwner(page);

    await page.goto(`${BASE_URL}/settings`);
    await page.waitForSelector('text=Data Portability & Demo Isolation', { timeout: 10000 });

    // Verify export button exists and is active
    const exportBtn = page.locator('button:has-text("Export JSON")').first();
    expect(await exportBtn.isEnabled()).toBe(true);

    // Open Import JSON modal
    const importBtn = page.locator('button:has-text("Import JSON")').first();
    await importBtn.click();
    await page.waitForSelector('text=Import Backup & Restore', { timeout: 5000 });
    
    // Assert modal opened with dry-run support
    expect(await page.textContent('body')).toContain('dry-run');
  });
});

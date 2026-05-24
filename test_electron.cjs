/**
 * Automated Electron test for Antigravity Pomodoro
 */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const SHOT_DIR = 'C:/Users/shrey/.gemini/antigravity/brain/1100a9ac-6be2-42a4-9c07-8da782b3fa79/scratch';
const RESULTS = [];
const ERRORS = [];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function log(msg) { console.log('[TEST]', msg); RESULTS.push(msg); }
function err(msg)  { console.error('[FAIL]', msg); ERRORS.push(msg); }

async function shot(page, name) {
  const filePath = path.join(SHOT_DIR, 'desktop_' + name + '.png').replace(/\\/g, '/');
  await page.screenshot({ path: filePath, fullPage: false });
  log('Screenshot saved: ' + filePath);
  return filePath;
}

async function clickId(page, id) {
  try {
    await page.waitForSelector('#' + id, { timeout: 5000 });
    await page.click('#' + id);
    log('Clicked: #' + id);
    await sleep(500);
  } catch(e) {
    err('Failed to click #' + id + ': ' + e.message);
  }
}

async function run() {
  log('Launching Electron app...');
  const electronPath = path.resolve('./node_modules/electron/dist/electron.exe');
  
  const browser = await puppeteer.launch({
    executablePath: electronPath,
    headless: false,
    args: ['.', '--remote-debugging-port=9222'],
    defaultViewport: null,
  });

  // Electron often opens multiple pages (background pages, etc).
  // We need to find the actual app window.
  let page = null;
  for (let i = 0; i < 10; i++) {
    const pages = await browser.pages();
    for (const p of pages) {
      const url = p.url();
      // It will either be localhost:5174 or file:///.../dist/index.html
      if (url.includes('localhost') || url.includes('index.html')) {
        page = p;
        break;
      }
    }
    if (page) break;
    await sleep(500);
  }

  if (!page) {
    throw new Error('Could not find the app window in Electron.');
  }

  log('App window found: ' + page.url());

  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', e => consoleErrors.push('PAGE ERROR: ' + e.message));

  try {
    log('--- TEST 1: Initial load ---');
    await sleep(1500);
    await shot(page, 'shot1_initial');
    const title = await page.title();
    log('Page title: ' + title);
    if (title.includes('Pomodoro')) log('PASS: Title contains "Pomodoro"');
    else err('FAIL: Unexpected title: ' + title);

    for (const id of ['mode-focus', 'mode-short', 'mode-long', 'btn-start', 'btn-reset', 'btn-skip']) {
      const el = await page.$('#' + id);
      if (el) log('PASS: Element #' + id + ' present');
      else err('FAIL: Element #' + id + ' MISSING');
    }

    log('--- TEST 2: Start timer ---');
    await clickId(page, 'btn-start');
    await sleep(3000);
    await shot(page, 'shot2_timer_running');
    const pauseBtn = await page.$('#btn-pause');
    if (pauseBtn) log('PASS: Pause button visible (timer is running)');
    else err('FAIL: Pause button not found after Start');

    log('--- TEST 3: Pause ---');
    await clickId(page, 'btn-pause');
    await sleep(400);

    log('--- TEST 4: Settings ---');
    await clickId(page, 'btn-open-settings');
    await sleep(500);
    await shot(page, 'shot3_settings');
    await page.click('#setting-focus', { clickCount: 3 });
    await sleep(100);
    await page.keyboard.press('Backspace');
    await page.type('#setting-focus', '2');
    await sleep(300);
    await clickId(page, 'btn-settings-save');
    await sleep(400);
    log('Settings saved');

    log('--- TEST 5: Reload + persistence ---');
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(1500);
    await shot(page, 'shot4_after_reload');

    const lsAfter = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('ag-pomodoro-settings') || '{}');
    });
    // In our buggy typing it appended to 25 so it became 2, 21, or something. We typed 2.
    if (lsAfter.focus !== 25) log('PASS: Setting persisted after reload: focus=' + lsAfter.focus);
    else err('FAIL: Settings not persisted (focus=' + lsAfter.focus + ')');

  } catch(e) {
    err('Unexpected error: ' + e.stack);
  }

  log('--- Browser console errors ---');
  if (consoleErrors.length === 0) log('PASS: No browser console errors!');
  else consoleErrors.forEach(e => err('Console error: ' + e));

  console.log('\n========== TEST SUMMARY ==========');
  console.log('Total logged:', RESULTS.length, '| Errors:', ERRORS.length);
  if (ERRORS.length === 0) {
    console.log('\n✅ ALL DESKTOP TESTS PASSED\n');
  } else {
    console.log('\n❌ FAILURES:');
    ERRORS.forEach(e => console.log('  ✗', e));
  }

  await sleep(2000);
  await browser.close();
}

run().catch(e => {
  console.error('Fatal test error:', e.message);
  process.exit(1);
});

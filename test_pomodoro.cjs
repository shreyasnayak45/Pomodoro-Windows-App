/**
 * Automated browser test for Antigravity Pomodoro
 * Tests: mode switching, start/pause/resume/reset/skip, history, settings, localStorage persistence
 */
const puppeteer = require('puppeteer');
const path = require('path');

const BASE_URL = 'http://localhost:5174/';
const SHOT_DIR = 'C:/Users/shrey/.gemini/antigravity/brain/1100a9ac-6be2-42a4-9c07-8da782b3fa79/scratch';
const RESULTS = [];
const ERRORS = [];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function log(msg) { console.log('[TEST]', msg); RESULTS.push(msg); }
function err(msg)  { console.error('[FAIL]', msg); ERRORS.push(msg); }

async function shot(page, name) {
  const filePath = path.join(SHOT_DIR, name + '.png').replace(/\\/g, '/');
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
  log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,820'],
    defaultViewport: { width: 1280, height: 820 },
  });

  const page = await browser.newPage();

  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', e => consoleErrors.push('PAGE ERROR: ' + e.message));

  try {
    // 1. Navigate & initial screenshot
    log('--- TEST 1: Initial load ---');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(1500);
    await shot(page, 'shot1_initial');
    const title = await page.title();
    log('Page title: ' + title);
    if (title.includes('Pomodoro')) log('PASS: Title contains "Pomodoro"');
    else err('FAIL: Unexpected title: ' + title);

    // Check key elements exist
    for (const id of ['mode-focus', 'mode-short', 'mode-long', 'btn-start', 'btn-reset', 'btn-skip']) {
      const el = await page.$('#' + id);
      if (el) log('PASS: Element #' + id + ' present');
      else err('FAIL: Element #' + id + ' MISSING');
    }

    // 2. Switch to Short Break
    log('--- TEST 2: Short Break mode ---');
    await clickId(page, 'mode-short');
    await sleep(600);
    await shot(page, 'shot2_short_break');

    // 3. Long Break
    log('--- TEST 3: Long Break mode ---');
    await clickId(page, 'mode-long');
    await sleep(400);

    // 4. Back to Focus
    log('--- TEST 4: Back to Focus ---');
    await clickId(page, 'mode-focus');
    await sleep(400);

    // 5. Start timer
    log('--- TEST 5: Start timer ---');
    await clickId(page, 'btn-start');
    await sleep(3000);
    await shot(page, 'shot3_timer_running');
    const pauseBtn = await page.$('#btn-pause');
    if (pauseBtn) log('PASS: Pause button visible (timer is running)');
    else err('FAIL: Pause button not found after Start');

    // 6. Pause
    log('--- TEST 6: Pause ---');
    await clickId(page, 'btn-pause');
    await sleep(400);
    const resumeBtn = await page.$('#btn-resume');
    if (resumeBtn) log('PASS: Resume button visible (timer paused)');
    else err('FAIL: Resume button not found after Pause');

    // 7. Resume
    log('--- TEST 7: Resume ---');
    await clickId(page, 'btn-resume');
    await sleep(1000);
    const pauseBtn2 = await page.$('#btn-pause');
    if (pauseBtn2) log('PASS: Running again after Resume');
    else err('FAIL: Not running after Resume');

    // 8. Reset
    log('--- TEST 8: Reset ---');
    await clickId(page, 'btn-reset');
    await sleep(400);
    const startBtn = await page.$('#btn-start');
    if (startBtn) log('PASS: Start button visible after Reset');
    else err('FAIL: Start button missing after Reset');

    // 9. Start → Skip
    log('--- TEST 9: Start then Skip ---');
    await clickId(page, 'btn-start');
    await sleep(1500);
    await clickId(page, 'btn-skip');
    await sleep(500);
    const startBtn2 = await page.$('#btn-start');
    if (startBtn2) log('PASS: Start button back after Skip');
    else err('FAIL: Start button missing after Skip');

    // 10. Session History
    log('--- TEST 10: Session History ---');
    await clickId(page, 'btn-toggle-history');
    await sleep(600);
    await shot(page, 'shot4_history');

    // 11. Settings panel
    log('--- TEST 11: Settings panel ---');
    await clickId(page, 'btn-open-settings');
    await sleep(500);
    await shot(page, 'shot5_settings');
    const focusInput = await page.$('#setting-focus');
    const shortInput = await page.$('#setting-short');
    const longInput  = await page.$('#setting-long');
    if (focusInput && shortInput && longInput) log('PASS: All 3 duration inputs present');
    else err('FAIL: Some duration inputs missing');

    // Change focus duration to 1 minute for quick test
    await page.click('#setting-focus', { clickCount: 3 });
    await sleep(100);
    await page.keyboard.press('Backspace');
    await page.type('#setting-focus', '1');
    await sleep(300);
    log('Changed focus duration to 1 min');

    // Save settings
    await clickId(page, 'btn-settings-save');
    await sleep(400);
    log('Settings saved');

    // 12. Sound toggle
    log('--- TEST 12: Sound toggle ---');
    await clickId(page, 'btn-toggle-sound');
    await sleep(300);
    log('Sound toggled off');
    await clickId(page, 'btn-toggle-sound');
    await sleep(300);
    log('Sound toggled back on');

    // 13. Check localStorage
    log('--- TEST 13: localStorage check ---');
    const lsData = await page.evaluate(() => ({
      settings: localStorage.getItem('ag-pomodoro-settings'),
      history:  localStorage.getItem('ag-pomodoro-history'),
      sound:    localStorage.getItem('ag-pomodoro-sound'),
    }));
    log('  settings: ' + lsData.settings);
    log('  sound: ' + lsData.sound);
    const histArr = JSON.parse(lsData.history || '[]');
    log('  history entries: ' + histArr.length);
    if (histArr.length > 0) log('PASS: History persisted in localStorage');
    else log('NOTE: 0 history entries (skip may not have saved if <5s elapsed)');
    if (lsData.sound !== null) log('PASS: Sound pref in localStorage: ' + lsData.sound);
    if (lsData.settings) {
      const parsed = JSON.parse(lsData.settings);
      if (parsed.focus === 1) log('PASS: Settings (focus=1m) persisted in localStorage');
      else log('NOTE: Settings focus value: ' + parsed.focus);
    }

    // 14. Reload and verify persistence
    log('--- TEST 14: Reload + persistence ---');
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(1500);
    await shot(page, 'shot6_after_reload');

    const lsAfter = await page.evaluate(() => ({
      settings: JSON.parse(localStorage.getItem('ag-pomodoro-settings') || '{}'),
      history:  JSON.parse(localStorage.getItem('ag-pomodoro-history') || '[]'),
      sound:    localStorage.getItem('ag-pomodoro-sound'),
    }));
    if (lsAfter.settings.focus === 1) log('PASS: focus=1m setting persisted after reload');
    else err('FAIL: Settings not persisted (focus=' + lsAfter.settings.focus + ')');
    if (lsAfter.history.length > 0) log('PASS: ' + lsAfter.history.length + ' history entries persisted after reload');
    if (lsAfter.sound !== null) log('PASS: Sound pref persisted after reload: ' + lsAfter.sound);

    // Final screenshot with history open
    await clickId(page, 'btn-toggle-history');
    await sleep(500);
    await shot(page, 'shot7_final');

  } catch(e) {
    err('Unexpected error: ' + e.stack);
  }

  // Console errors summary
  log('--- Browser console errors ---');
  if (consoleErrors.length === 0) log('PASS: No browser console errors!');
  else consoleErrors.forEach(e => err('Console error: ' + e));

  // Summary
  console.log('\n========== TEST SUMMARY ==========');
  console.log('Total logged:', RESULTS.length, '| Errors:', ERRORS.length);
  if (ERRORS.length === 0) {
    console.log('\n✅ ALL TESTS PASSED\n');
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

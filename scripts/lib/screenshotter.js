import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const WIDTH = 800;
const HEIGHT = 600;

/**
 * Launch a headless Chromium browser configured for WebGL via SwiftShader.
 */
export async function launchBrowser() {
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--use-angle=metal',
      '--enable-gpu',
      '--ignore-gpu-blocklist',
      '--disable-setuid-sandbox',
      '--no-sandbox',
    ],
  });
  return browser;
}

/**
 * Screenshot a single project.
 *
 * @param {import('playwright').Browser} browser
 * @param {string} pageUrl - Full URL to load
 * @param {string} outputPath - Where to save the .png file
 * @param {object} opts
 * @param {number} opts.delay - ms to wait after canvas detected
 * @param {number} opts.timeout - page load timeout in ms
 * @returns {{ success: boolean, error?: string }}
 */
export async function screenshotProject(browser, pageUrl, outputPath, opts = {}) {
  const { delay = 2000, timeout = 15000 } = opts;

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Suppress noisy console errors from Three.js projects
  page.on('pageerror', () => {});
  page.on('console', () => {});

  try {
    await page.goto(pageUrl, {
      waitUntil: 'domcontentloaded',
      timeout,
    });

    // Wait for a <canvas> element to appear (Three.js renders to canvas)
    let canvas;
    try {
      canvas = await page.waitForSelector('canvas', { timeout: 10000 });
    } catch {
      // No canvas found — fall back to viewport screenshot
      canvas = null;
    }

    // Give the scene time to render
    await page.waitForTimeout(delay);

    // Ensure output directory exists
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // Take screenshot as PNG buffer
    let pngBuffer;
    if (canvas) {
      pngBuffer = await canvas.screenshot({ type: 'png' });
    } else {
      pngBuffer = await page.screenshot({ type: 'png' });
    }

    // Convert to 800x600 PNG using sharp
    await sharp(pngBuffer)
      .resize(WIDTH, HEIGHT, { fit: 'cover' })
      .png()
      .toFile(outputPath);

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  } finally {
    await page.close();
    await context.close();
  }
}

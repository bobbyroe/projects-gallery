#!/usr/bin/env node

/**
 * Screenshots each project from ../github-youtube/ and saves PNGs to
 * public/media/{slug}.png.
 *
 * Starts a local static server rooted at the three-play/ parent so
 * URLs match the /github-youtube/{slug}/ paths in projects.json.
 *
 * Usage:
 *   node scripts/generate-thumbnails.js
 *   node scripts/generate-thumbnails.js --skip-existing
 *   node scripts/generate-thumbnails.js --project 3D-cubiverse
 *   node scripts/generate-thumbnails.js --update-json   # writes media field back to projects.json
 *   node scripts/generate-thumbnails.js --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { startServer } from './lib/server.js';
import { launchBrowser, screenshotProject } from './lib/screenshotter.js';
import { Progress } from './lib/progress.js';
import { updateMediaFields } from './lib/update-media-fields.js';

const { values: args } = parseArgs({
  options: {
    project:         { type: 'string' },
    delay:           { type: 'string',  default: '2000' },
    timeout:         { type: 'string',  default: '15000' },
    'skip-existing': { type: 'boolean', default: false },
    'update-json':   { type: 'boolean', default: false },
    'dry-run':       { type: 'boolean', default: false },
    port:            { type: 'string',  default: '3456' },
  },
  strict: false,
});

const DELAY         = parseInt(args.delay, 10);
const TIMEOUT       = parseInt(args.timeout, 10);
const PORT          = parseInt(args.port, 10);
const SKIP_EXISTING = args['skip-existing'];
const UPDATE_JSON   = args['update-json'];
const DRY_RUN       = args['dry-run'];
const SINGLE        = args.project;

const ROOT          = path.resolve(import.meta.dirname, '..');
const PROJECTS_JSON = path.join(ROOT, 'data', 'projects.json');
const GITHUB_YT_DIR = path.resolve(ROOT, '..', 'github-youtube');
const SERVER_ROOT   = path.resolve(ROOT, '..');   // serve from three-play/
const MEDIA_DIR     = path.join(ROOT, 'public', 'media');

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(GITHUB_YT_DIR)) {
    console.error(`github-youtube directory not found: ${GITHUB_YT_DIR}`);
    process.exit(1);
  }

  const allProjects = JSON.parse(fs.readFileSync(PROJECTS_JSON, 'utf-8'));

  // Keep only projects that have a resolvable index.html
  let projects = allProjects.filter((p) =>
    fs.existsSync(path.join(GITHUB_YT_DIR, p.slug, 'index.html'))
  );

  if (SINGLE) {
    projects = projects.filter((p) => p.slug === SINGLE);
    if (projects.length === 0) {
      console.error(`Project not found or has no index.html: ${SINGLE}`);
      process.exit(1);
    }
  }

  console.log('Thumbnail Generator');
  console.log(`  Projects: ${projects.length}`);
  console.log(`  Serving:  ${SERVER_ROOT}`);
  console.log(`  Output:   ${MEDIA_DIR}`);
  console.log(`  Delay:    ${DELAY}ms | Timeout: ${TIMEOUT}ms`);
  if (SKIP_EXISTING) console.log('  Skip existing: yes');
  if (DRY_RUN)       console.log('  Dry run: yes');
  console.log('');

  if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

  const { url: baseUrl, close: closeServer } = await startServer(SERVER_ROOT, PORT);
  console.log(`Server: ${baseUrl}\n`);

  const browser = await launchBrowser();
  const progress = new Progress(projects.length);

  try {
    for (const project of projects) {
      const { slug } = project;
      const outputPath = path.join(MEDIA_DIR, `${slug}.png`);

      if (SKIP_EXISTING && fs.existsSync(outputPath)) {
        progress.skip(slug, 'already exists');
        continue;
      }

      if (DRY_RUN) {
        progress.success(slug);
        continue;
      }

      const pageUrl = `${baseUrl}/github-youtube/${slug}/`;
      const result = await screenshotProject(browser, pageUrl, outputPath, {
        delay: DELAY,
        timeout: TIMEOUT,
      });

      if (result.success) {
        progress.success(slug);
      } else {
        progress.fail(slug, result.error);
      }
    }
  } finally {
    await browser.close();
    await closeServer();
  }

  progress.summary();

  if (UPDATE_JSON) {
    console.log('\nUpdating data/projects.json media fields...');
    updateMediaFields(PROJECTS_JSON, MEDIA_DIR, { dryRun: DRY_RUN });
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

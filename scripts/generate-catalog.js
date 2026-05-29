#!/usr/bin/env node

/**
 * Scans ../github-youtube/ and generates draft entries for data/projects.json.
 *
 * For each project dir: extracts title, description, and YouTube URL from
 * README.md, and detects any existing local image.
 *
 * Usage:
 *   node scripts/generate-catalog.js              # report new projects
 *   node scripts/generate-catalog.js --merge      # append new entries to projects.json
 *   node scripts/generate-catalog.js --merge --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    merge:     { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
  },
  strict: false,
});

const MERGE   = args.merge;
const DRY_RUN = args['dry-run'];

const ROOT          = path.resolve(import.meta.dirname, '..');
const GITHUB_YT_DIR = path.resolve(ROOT, '..', 'github-youtube');
const PROJECTS_JSON = path.join(ROOT, 'data', 'projects.json');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

// ── Parsers ─────────────────────────────────────────────────────────

function extractTitle(readme) {
  const match = readme.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function extractDescription(readme) {
  const lines = readme.split('\n');
  let pastFirstHeading = false;
  const paragraph = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!pastFirstHeading) {
      if (trimmed.startsWith('#')) pastFirstHeading = true;
      continue;
    }

    // Blank line ends a paragraph we've started collecting
    if (!trimmed) {
      if (paragraph.length) break;
      continue;
    }

    // Skip headings, rules, HTML, image syntax, badge lines
    if (
      trimmed.startsWith('#') ||
      trimmed.startsWith('---') ||
      trimmed.startsWith('===') ||
      trimmed.startsWith('<') ||
      trimmed.startsWith('![') ||
      trimmed.startsWith('[!')
    ) continue;

    paragraph.push(trimmed);
  }

  return paragraph.join(' ');
}

function extractYoutubeUrl(readme) {
  const match = readme.match(
    /https?:\/\/(?:youtu\.be\/[^\s)"'\]]+|(?:www\.)?youtube\.com\/(?:watch\?[^\s)"'\]]*v=[^\s)"'\]]+|playlist\?[^\s)"'\]]+))/
  );
  return match ? match[0] : '';
}

function findLocalImage(dirPath) {
  if (!fs.existsSync(dirPath)) return '';
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (IMAGE_EXTS.has(path.extname(file).toLowerCase())) return file;
  }
  return '';
}

// ── Main ─────────────────────────────────────────────────────────────

if (!fs.existsSync(GITHUB_YT_DIR)) {
  console.error(`github-youtube directory not found: ${GITHUB_YT_DIR}`);
  process.exit(1);
}

const existingProjects = fs.existsSync(PROJECTS_JSON)
  ? JSON.parse(fs.readFileSync(PROJECTS_JSON, 'utf-8'))
  : [];

const existingSlugs = new Set(existingProjects.map((p) => p.slug));

const projectDirs = fs.readdirSync(GITHUB_YT_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
  .map((d) => d.name)
  .sort();

const newEntries = [];

for (const dir of projectDirs) {
  if (existingSlugs.has(dir)) continue;

  const dirPath = path.join(GITHUB_YT_DIR, dir);
  const readmePath = path.join(dirPath, 'README.md');
  const readme = fs.existsSync(readmePath)
    ? fs.readFileSync(readmePath, 'utf-8')
    : '';

  newEntries.push({
    title:       extractTitle(readme) || dir,
    slug:        dir,
    description: extractDescription(readme),
    youtubeUrl:  extractYoutubeUrl(readme),
    link:        `/github-youtube/${dir}/index.html`,
    media:       findLocalImage(dirPath),
    createdAt:   '',
    category:    '',
    tags:        [],
  });
}

// ── Report ───────────────────────────────────────────────────────────

console.log(`github-youtube dirs:    ${projectDirs.length}`);
console.log(`In projects.json:       ${existingSlugs.size}`);
console.log(`New (not yet in JSON):  ${newEntries.length}`);
console.log('');

if (newEntries.length === 0) {
  console.log('Nothing to add — projects.json is up to date.');
  process.exit(0);
}

for (const e of newEntries) {
  const ytStatus  = e.youtubeUrl ? `✓ ${e.youtubeUrl}` : '✗ no YouTube URL';
  const imgStatus = e.media      ? `✓ ${e.media}`       : '✗ no local image';
  console.log(`  ${e.slug}`);
  console.log(`    title: ${e.title}`);
  console.log(`    desc:  ${e.description || '(none)'}`);
  console.log(`    yt:    ${ytStatus}`);
  console.log(`    img:   ${imgStatus}`);
  console.log('');
}

if (MERGE && !DRY_RUN) {
  const merged = [...existingProjects, ...newEntries];
  fs.writeFileSync(PROJECTS_JSON, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
  console.log(`Merged ${newEntries.length} new entr${newEntries.length === 1 ? 'y' : 'ies'} into data/projects.json`);
  console.log('Fill in createdAt, category, and tags before using in the gallery.');
} else if (MERGE && DRY_RUN) {
  console.log(`(dry run — would merge ${newEntries.length} entries into data/projects.json)`);
} else {
  console.log('Run with --merge to append these entries to data/projects.json.');
}

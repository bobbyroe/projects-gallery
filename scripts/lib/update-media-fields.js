import fs from 'node:fs';
import path from 'node:path';

/**
 * Update data/projects.json media fields to point at generated .png thumbnails.
 *
 * For each entry in data/projects.json, if a matching .png exists in mediaDir,
 * set the `media` field to `{slug}.png`.
 *
 * @param {string} dataJsonPath - Path to data/projects.json
 * @param {string} mediaDir - Path to public/media/
 * @param {object} opts
 * @param {boolean} opts.dryRun - If true, only report changes without writing
 * @returns {{ updated: string[], unchanged: string[] }}
 */
export function updateMediaFields(dataJsonPath, mediaDir, opts = {}) {
  const { dryRun = false } = opts;

  if (!fs.existsSync(dataJsonPath)) {
    console.log(`data/projects.json not found at ${dataJsonPath}, skipping update.`);
    return { updated: [], unchanged: [] };
  }

  const projects = JSON.parse(fs.readFileSync(dataJsonPath, 'utf-8'));
  const updated = [];
  const unchanged = [];

  for (const project of projects) {
    const slug = project.slug;
    if (!slug) continue;

    const pngFile = `${slug}.png`;
    const pngPath = path.join(mediaDir, pngFile);

    if (fs.existsSync(pngPath)) {
      if (project.media !== pngFile) {
        const oldMedia = project.media || '(none)';
        if (dryRun) {
          console.log(`  Would update "${slug}": media ${oldMedia} → ${pngFile}`);
        }
        project.media = pngFile;
        updated.push(slug);
      } else {
        unchanged.push(slug);
      }
    } else {
      unchanged.push(slug);
    }
  }

  if (!dryRun && updated.length > 0) {
    fs.writeFileSync(dataJsonPath, JSON.stringify(projects, null, 2) + '\n', 'utf-8');
  }

  console.log(`\nMedia fields: ${updated.length} updated, ${unchanged.length} unchanged.`);
  if (dryRun && updated.length > 0) {
    console.log('(dry run — no files were modified)');
  }

  return { updated, unchanged };
}

# YouTube / GitHub Projects Gallery — Requirements

## 1. Overview

A public-facing gallery showcasing 72 tutorial-companion creative coding projects from Robot Bobby's YouTube channel. Each project links to both a live demo and its corresponding YouTube video. Visitors browse a searchable, filterable grid and open projects directly in a new tab.

Separate from the experiments gallery (`three-play/gallery/`) but shares the same design language and cross-links to it.

---

## 2. Location & Deployment

- **Project root:** `three-play/yt-gallery/` (sibling to `projects-experiments/` and future `gallery/`)
- **Source projects:** `three-play/github-youtube/` (72 standalone projects)
- **Deployment:** GitHub Pages (static Vite output)
- **Stack:** React + TypeScript + Vite, plain CSS

---

## 3. Data Source

### 3.1 Catalog File

- **Location:** `yt-gallery/data/projects.json`
- **Generation:** Hybrid — a script auto-generates a draft by parsing each project's `README.md`, then the catalog is hand-curated before use

### 3.2 Script Responsibilities (`scripts/generate-catalog.js`)

For each project directory in `github-youtube/`:
- Extract **title** from the first `# Heading` in `README.md`
- Extract **description** from the first non-heading paragraph in `README.md`
- Extract **YouTube URL** from any `youtu.be` or `youtube.com` link in `README.md`
- Detect whether an existing local image exists (`.jpg`, `.png`, `.gif`, `.webp`) — record filename
- Output a draft `projects.json` entry with `category: ""` and `tags: []` left blank for manual curation

### 3.3 Project Schema

```json
{
  "title": "3D Glowing Cubiverse",
  "slug": "3D-cubiverse",
  "description": "A WebGPU-powered Three.js scene featuring 2,000 glowing wireframe cubes scattered across a sphere.",
  "youtubeUrl": "https://youtu.be/SYR5GOfHJGc",
  "link": "/github-youtube/3D-cubiverse/index.html",
  "media": "3D-cubiverse.png",
  "createdAt": "2024-06-01",
  "category": "webgpu",
  "tags": ["webgpu", "tsl", "instancing"]
}
```

### 3.4 Categories (Fixed Predefined List)

Assigned manually during curation. Suggested set (refine during curation):

- `shaders`
- `particles`
- `physics`
- `geometry`
- `webgpu`
- `animation`
- `art`
- `getting-started`
- `post-processing`
- `other`

---

## 4. Media / Thumbnails

- **Format:** PNG, stored in `yt-gallery/public/media/`
- **Priority:** use the project's existing local image (`.jpg`, `.png`, etc.), converted to PNG
- **Fallback:** Playwright screenshot for projects with no existing image
- **Naming:** `{slug}.png` (e.g., `3D-cubiverse.png`)

### Thumbnail Script (`scripts/generate-thumbnails.js`)

- Reads `projects.json`
- For each entry: check if `yt-gallery/public/media/{slug}.png` already exists — skip if so
- If source image exists in the project dir: copy + convert to PNG
- Otherwise: Playwright screenshot of the project's `index.html`

---

## 5. Pages & Routes

| Route | Description |
|---|---|
| `/` | Gallery grid (main and only page) |

No viewer page — clicking a project card opens it in a new tab.

---

## 6. Gallery Page (`/`)

### 6.1 Header

- Robot Bobby name/logo
- Social links: YouTube, GitHub, CodePen (placeholder URLs)
- Cross-link: "Experiments Gallery →" pointing to `three-play/gallery/`

### 6.2 Controls

- **Search input** — filters by title, description, and tags (client-side, debounced 300ms)
- **Category dropdown** — filters by `category` field; "All" is default

### 6.3 Grid

- Masonry-style CSS grid
- Default sort: **newest first** (`createdAt` descending)
- Responsive columns:
  - Mobile: 2 columns
  - Tablet: 3 columns
  - Desktop: 4+ columns
- Pagination or "Load More" — page size 24

### 6.4 Project Card

- Thumbnail image (PNG, lazy-loaded)
- Title below the image (not overlaid)
- YouTube badge/button — opens `youtubeUrl` in a new tab (hidden if `youtubeUrl` is empty)
- Clicking the card (outside the YouTube badge) opens `link` in a new tab

---

## 7. UI / Style

Matches the experiments gallery design language:

- **Color palette:** dark base, grayscale only, no accent color
- **Theme:** dark mode default; light/dark toggle with CSS custom properties + `localStorage` persistence
- **Typography:** system font stack
- **Accessibility:** semantic HTML, alt text on all images, keyboard navigation

---

## 8. Project Structure

```
yt-gallery/
├── index.html
├── src/
│   ├── main.tsx            # App entry
│   ├── App.tsx             # Root component
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Controls.tsx    # Search + category filter
│   │   ├── Grid.tsx        # Masonry grid
│   │   ├── ProjectCard.tsx # Card with YouTube badge
│   │   └── ThemeToggle.tsx
│   ├── lib/
│   │   ├── dataLoader.ts   # Load + filter projects.json
│   │   └── types.ts        # Project type definitions
│   └── style.css
├── data/
│   └── projects.json
├── public/
│   └── media/              # PNG thumbnails
├── scripts/
│   ├── generate-catalog.js     # Parses READMEs → draft projects.json
│   └── generate-thumbnails.js  # Copies/converts/screenshots thumbnails
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 9. Cross-Gallery Links

- This gallery links to `three-play/gallery/` ("Experiments Gallery") in the header
- The experiments gallery should link back to this one ("YouTube Tutorials Gallery") — noted for that PRD

---

## 10. Out of Scope (v1)

- Per-project detail/viewer page
- Tag filter chips
- Sorting controls (always newest first)
- Admin UI for editing projects.json
- Embedded YouTube player
- Comments or social features

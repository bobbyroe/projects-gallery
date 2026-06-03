# Robot Bobby Three.js Projects

A public gallery showcasing creative coding projects from the [Robot Bobby](https://www.youtube.com/@RobotBobby) YouTube channel. Browse, search, and filter 72 tutorial-companion demos — each card links to the live project and its YouTube video.

**Stack:** React 19 + TypeScript + Vite, plain CSS, GitHub Pages

![image](./screenshot.png)

## Development

```bash
pnpm install
pnpm dev
```

## Data & Thumbnails

Project metadata lives in `data/projects.json`. Two scripts in `scripts/` maintain it:

| Script | Purpose |
|---|---|
| `generate-catalog.js` | Parses `README.md` files in `github-youtube/` to draft `projects.json` entries |
| `generate-thumbnails.js` | Copies/converts existing images or takes Playwright screenshots into `public/media/` |

## Build & Deploy

```bash
pnpm build    # outputs to dist/
pnpm preview  # preview the production build locally
```

Deployed to GitHub Pages from `dist/`.

# CLAUDE.md — tools.florianabry.me

This file provides context for AI-assisted development on this project.

## Project Summary

A static website hosting small, self-contained browser tools. All processing is client-side — no backend, no server runtime. Hosted on OVH static file hosting at `https://tools.florianabry.me`.

Full requirements: see [docs/requirements.md](docs/requirements.md).

## Commands

```bash
npm run dev        # Start local dev server (http://localhost:4321)
npm run build      # Build to ./dist/
npm run preview    # Preview the built output locally
```

## Project Structure

```
tools/
├── public/
│   └── vendor/                    # Vendored JS libraries (with license headers intact)
│       ├── jsQR.js                # Cosmo Wolfe — MIT
│       └── pdf.worker.min.mjs    # PDF.js Web Worker — Apache 2.0
├── src/
│   ├── components/
│   │   ├── Navbar.astro
│   │   ├── Footer.astro
│   │   ├── ToolCard.astro
│   │   ├── AmbientBackground.astro   # Breathing dot grid canvas animation
│   │   ├── DropZone.astro            # Shared reusable file drop zone
│   │   └── ThumbnailGrid.astro       # Shared drag-and-drop thumbnail grid
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro               # Tool directory / home
│   │   ├── 404.astro
│   │   ├── legal.astro
│   │   ├── qr-generator.astro
│   │   ├── qr-reader.astro
│   │   ├── images-to-pdf.astro
│   │   ├── pdf-to-images.astro
│   │   ├── reorder-pdf.astro
│   │   ├── merge-pdf.astro
│   │   ├── excel-editor.astro        # planned
│   │   ├── excel-to-csv.astro        # planned
│   │   └── examiner-tracker.astro    # planned — Google OAuth + Drive
│   └── styles/
│       └── global.css           # Tailwind + DaisyUI theme
├── docs/
│   └── requirements.md
├── .github/
│   └── workflows/
│       └── deploy.yml           # Build + FTP deploy to OVH on push to main
├── astro.config.mjs
├── package.json
└── CLAUDE.md
```

## Tech Stack

- **Astro** — static site generator (`output: static`). Each page is a `.astro` file.
- **Tailwind CSS v4** — utility-first styling, configured via `src/styles/global.css` (no `tailwind.config.js` in v4)
- **DaisyUI v5** — component library on top of Tailwind, configured via `@plugin "daisyui"` in CSS
- **Vite** — bundler (managed by Astro)

## Design System

### Theme: warm dark (custom DaisyUI theme named `tools-dark`)

| Token | Value |
|---|---|
| Background | `#1c1917` (stone-900) |
| Surface | `#292524` (stone-800) |
| Border | `#44403c` (stone-700) |
| Text | `#fafaf9` (stone-50) |
| Primary accent | `#f59e0b` (amber-500) |
| Secondary accent | `#fb923c` (orange-400) |

Font: **Poppins** (400, 600, 700) from Google Fonts.

### Component conventions
- Tool pages use `BaseLayout` with a `title` and `description` prop
- Each tool page has a privacy notice: *"Your files never leave your device."*
- Consistent page structure: header → tool card → attribution footer note

## Libraries Per Tool

| Tool | Library | Source |
|---|---|---|
| QR Generator | qr-code-styling (MIT) | npm |
| QR Reader | jsQR (Cosmo Wolfe, MIT) | `public/vendor/jsQR.js` |
| Images to PDF | pdf-lib (MIT) | npm (`pdf-lib`) |
| PDF to Images | PDF.js (Apache 2.0) + jszip (MIT) | npm (`pdfjs-dist`, `jszip`) |
| Reorder & Delete | PDF.js (Apache 2.0) + pdf-lib (MIT) | npm (`pdfjs-dist`, `pdf-lib`) |
| Merge PDFs | pdf-lib (MIT) | npm (`pdf-lib`) |
| Excel Editor | SheetJS CE (Apache 2.0) | npm (`xlsx`) |
| Excel to CSV | SheetJS CE (Apache 2.0) | npm (`xlsx`) |
| Examiner Tracker | Google Identity Services (Google) | CDN (`accounts.google.com/gsi/client`) |

## Library Policy

- **Vendored** libraries go in `public/vendor/`. Never strip the license/copyright comment at the top of the file.
- **npm** libraries are imported as ES modules inside `<script>` blocks or imported in frontmatter.
- Attribution is shown on each tool page (small note near the footer of the tool card).

## Shared Components

### DropZone.astro
Reusable file input with drag-and-drop. Props: `id`, `accept`, `multiple`, `label`.
Emits custom DOM event `dropzone:files` with `detail: FileList` when files are selected/dropped.
Used by: all PDF tools, both Excel tools.

### ThumbnailGrid.astro
Drag-and-drop grid of image/page thumbnails. Each card has a preview + label + ✕ remove button.
Uses HTML5 drag-and-drop API. Exposes `getThumbnailOrder()` returning current ordered item array.
Used by: Images→PDF (image previews), Reorder & Delete (PDF page thumbnails via PDF.js).

### AmbientBackground.astro
Fixed canvas behind all content. Breathing dot grid: amber dots on a grid, each pulsing with a sine wave phase-offset from the center. z-index: 0. All page content sits at z-index: 10+.

## PDF.js Worker Setup

PDF.js rendering must use a Web Worker to avoid blocking the UI on large files.

```js
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.min.mjs';
```

The worker file must be copied from `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` to `public/vendor/pdf.worker.min.mjs`. Do this manually or add a `postinstall` script.
Check the exact filename with: `ls node_modules/pdfjs-dist/build/`

## Examiner Tracker — Auth & Storage Pattern

This tool is the exception to the "no external dependencies" rule — it requires Google OAuth.

**Auth flow:** Google OAuth 2.0 PKCE (no backend, no secret)
- Load `https://accounts.google.com/gsi/client` (Google Identity Services)
- Client ID stored in `.env` as `PUBLIC_GOOGLE_CLIENT_ID` (safe to expose — it's a public identifier)
- Scope: `https://www.googleapis.com/auth/drive.appdata`
- Token stored in `localStorage`, check expiry on page load

**Data storage:** Google Drive `appDataFolder`
- One file: `examiner-data.json`
- Read on load, write on every change
- Cache in `localStorage` for offline use, sync on reconnect

**Google Cloud setup required (one-time, by developer):**
1. Create project at console.cloud.google.com
2. Enable Google Drive API
3. Configure OAuth consent screen (External, scopes: drive.appdata)
4. Create OAuth 2.0 Client ID (Web application, authorised origins: `https://tools.florianabry.me` + `http://localhost:4321`)
5. Add `PUBLIC_GOOGLE_CLIENT_ID=your-client-id` to `.env` (and as GitHub Actions secret if needed at build time)

**Never commit `.env`** — add it to `.gitignore`.

## WASM Policy

If a future tool requires native-speed processing, use **Rust + wasm-pack**. Avoid C, Go, or Python WASM targets unless a Rust equivalent doesn't exist.

## Deployment

Push to `main` triggers GitHub Actions:
1. Checkout + Node 22 setup
2. `npm ci`
3. `npm run build`
4. FTP deploy `./dist/` → OVH via `SamKirkland/FTP-Deploy-Action@v4.3.5`

Required GitHub repository secrets:
- `PROD_HOST` — FTP server hostname
- `PROD_USER` — FTP username
- `PROD_PASS` — FTP password
- `PROD_PATH` — Remote path for `tools.florianabry.me` webroot

## Adding a New Tool

1. Create `src/pages/tool-name.astro` using `BaseLayout`
2. Add the tool card to `src/pages/index.astro`
3. If the library is small/single-file: vendor it in `public/vendor/` with attribution
4. If the library is large: install via npm and import as ES module
5. Include the privacy notice and attribution on the tool page
6. Document the tool in `docs/requirements.md`

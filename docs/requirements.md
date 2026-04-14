# tools.florianabry.me — Requirements

## Overview

A static website centralizing small, self-contained web tools. Hosted on a subdomain of florianabry.me on OVH static hosting (no server-side runtime). All processing runs client-side in the user's browser — files never leave the user's device.

## Hosting & Deployment

- **URL**: `https://tools.florianabry.me`
- **Hosting**: OVH static file hosting (no Node.js, no PHP, no backend)
- **Deployment**: GitHub Actions on push to `main` → FTP via `SamKirkland/FTP-Deploy-Action`
- **Repository**: `https://github.com/florian-naity/tools.git`

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Astro (static output) | Same stack as personal site, builds to pure HTML/CSS/JS |
| Styling | Tailwind CSS v4 + DaisyUI v5 | Consistent tooling, component library |
| Theme | Custom warm dark | Distinct from personal site (Nord), tech-y feeling |
| Display font | Fraunces Variable (`opsz`) | Expressive editorial serif for headings and brand |
| Body font | Poppins (400, 600, 700) | Legible UI font for descriptions, labels, body copy |
| WASM (if needed) | Rust | Preferred over C/Go/Python for WASM targets |

## Design System

### Color Palette (warm dark)

| Token | Value | Usage |
|---|---|---|
| Base-100 | `#1c1917` | Page background (stone-900) |
| Base-200 | `#292524` | Cards, panels (stone-800) |
| Base-300 | `#44403c` | Borders, dividers (stone-700) |
| Base-content | `#fafaf9` | Primary text (stone-50) |
| Primary | `#fbbf24` | CTAs, hover states, focus rings (amber-400) |
| Primary-content | `#1c1917` | Text on primary bg |
| Secondary | `#a78bfa` | Cool accent counterpoint (violet-400) |
| Accent | `#fb923c` | Brand colour, section labels (orange-400) |
| Error | `#f87171` | Error states (red-400) |
| Success | `#86efac` | Success states (green-300) |

### Typography
- Display / headings: **Fraunces Variable** (`@fontsource-variable/fraunces`), `opsz` axis pinned to 144
- Body / UI: **Poppins** (Google Fonts via fontsource), weights 400 / 600 / 700
- Fallback: `system-ui, sans-serif`

## Privacy Principle

All tools process data entirely in the browser. No file is uploaded to any server. This should be stated clearly on each tool page.

## Initial Tool Scope

### 1. QR Code Generator
- Input: text or URL
- Output: downloadable QR code image (PNG, SVG)
- Library: **qr-code-styling** (MIT) — via npm
- Credit: visible attribution on the page

### 2. QR Code Reader
- Input: uploaded image file containing a QR code
- Output: decoded string, copyable to clipboard
- Library: **jsQR** by Cosmo Wolfe (MIT) — vendored
- Mechanism: draw image to canvas, read pixel data, pass to jsQR

### 3. Images to PDF
- Input: N image files (PNG, JPG, WebP), drag-and-drop reorderable grid
- Page size: "Fit image" (default) or A4/Letter with margin options
- Output: single PDF download
- Libraries: **pdf-lib** (MIT) — via npm
- Detail: see [docs/pdf-tools.md](pdf-tools.md)

### 4. PDF to Images
- Input: 1 PDF file
- Options: resolution slider (72–300 DPI, default 150), format toggle PNG (default) / JPG, JPG quality slider
- Output: ZIP file containing one image per page
- Libraries: **PDF.js** (Apache 2.0) + **jszip** (MIT) — via npm
- Detail: see [docs/pdf-tools.md](pdf-tools.md)

### 5. Reorder & Delete Pages
- Input: 1 PDF file
- UI: drag-and-drop thumbnail grid, ✕ to delete pages
- Output: reordered/trimmed PDF download
- Libraries: **PDF.js** (Apache 2.0) + **pdf-lib** (MIT) — via npm
- Detail: see [docs/pdf-tools.md](pdf-tools.md)

### 6. Merge PDFs
- Input: N PDF files, drag-and-drop orderable list
- Output: single merged PDF download
- Library: **pdf-lib** (MIT) — via npm
- Detail: see [docs/pdf-tools.md](pdf-tools.md)

## Planned Tools

### 7. Excel Viewer / Editor
- Input: uploaded .xlsx / .xls / .ods file
- Output: rendered spreadsheet, editable in browser, re-downloadable as .xlsx
- Library: **SheetJS community edition** (Apache 2.0) — via npm

### 8. Excel to CSV
- Input: uploaded .xlsx / .xls file, sheet selection
- Output: .csv file download
- Library: **SheetJS community edition** (Apache 2.0) — via npm

### 9. Parent Examiner — Productivity & Goals Tracker
- Target users: parent examiners (small, defined group)
- Auth: Google OAuth 2.0 PKCE (client-side only, no backend — client ID from Google Cloud Console)
- Storage: one JSON file per user in their personal Google Drive `appDataFolder` (hidden folder, only visible to this app)
- Session: access token in `localStorage`, silent re-auth on expiry
- Offline: `localStorage` cache, synced to Drive on reconnect

#### Features (TBD — to be refined)
- Set and track productivity goals
- Log daily/weekly examiner activity
- View progress over time (charts)
- Data fully owned by the user — lives in their Google Drive, not on any server

#### Technical notes
- OAuth PKCE requires a **Google Cloud Console project** with Drive API enabled and an OAuth consent screen configured
- Client ID (public, safe to commit) stored in Astro env var (`PUBLIC_GOOGLE_CLIENT_ID`)
- Scopes required: `https://www.googleapis.com/auth/drive.appdata`
- Data format: JSON (structured records, easy to migrate)
- No server, no database — the app is a pure frontend that reads/writes the user's own Drive

## Library Policy

- **Vendored** (copied into `public/vendor/`): small single-file libraries used directly in `<script>` tags (jsQR at `public/vendor/jsQR.js`); also PDF.js worker (`public/vendor/pdf.worker.min.mjs`)
- **npm** (bundled by Astro/Vite): larger libraries imported as ES modules (pdfjs-dist, pdf-lib, jszip, SheetJS, qr-code-styling)
- All vendored files retain their original license/copyright comment header
- Attribution shown on relevant tool pages

## Future Considerations

- Additional tools can be added as new pages under `src/pages/`
- WASM tools (Rust) to be scaffolded with `wasm-pack` when needed (e.g. image compression, video conversion)
- Each tool is fully self-contained — no shared state between tools

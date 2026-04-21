# PDF Tools — Detailed Requirements

Part of [tools.florianabry.me requirements](requirements.md).

## Shared Architecture

### Libraries

| Package | Version | License | Purpose |
|---|---|---|---|
| `pdfjs-dist` | npm | Apache 2.0 | Render PDF pages to canvas (thumbnails + image export) |
| `pdf-lib` | npm | MIT | Create, merge, reorder PDFs |
| `jszip` | npm | MIT | Bundle exported images into a .zip |

### PDF.js Web Worker

PDF.js rendering runs in a Web Worker to keep the UI responsive, especially on large PDFs. Worker file served from `public/vendor/pdf.worker.min.mjs` (copied from `node_modules/pdfjs-dist/build/` at build time via a small script, or referenced directly).

Configuration:
```js
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.min.mjs';
```

### Shared Components

#### `DropZone.astro`
Reusable file drop zone. Props:
- `id` (string) — unique identifier, used to scope events
- `accept` (string) — MIME types / extensions (e.g. `"application/pdf"`, `"image/*"`)
- `multiple` (boolean) — allow multiple file selection
- `label` (string) — instruction text shown inside the zone

Emits a custom DOM event `dropzone:files` on the element, with `detail: FileList`.

#### `ThumbnailGrid.astro`
Drag-and-drop thumbnail grid. Used for both Images→PDF and Reorder & Delete.
- Renders items as cards with a preview image/canvas + filename/page number
- Drag handles on each card (HTML5 drag-and-drop API)
- ✕ button on each card to remove
- Exposes `getThumbnailOrder()` method returning current ordered array of items

---

## Tool 3 — Images to PDF

**Page:** `src/pages/images-to-pdf.astro`

### Input
- N image files (PNG, JPG, WebP, GIF) via DropZone (multiple)
- Drag-and-drop reordering via ThumbnailGrid

### Options
- **Page size toggle**: "Fit image" (default) or "A4 / Letter"
  - Fit image: each PDF page matches the image pixel dimensions
  - A4: 595×842pt; Letter: 612×792pt — image scaled to fit with optional margin
- **Margin** (shown only when A4/Letter selected): 0 / 10 / 20 / 40pt

### Output
- Single PDF file download (`images.pdf`)

### Implementation notes
- Use `pdf-lib` `PDFDocument.create()`, embed each image with `embedJpg` / `embedPng`
- For A4/Letter: scale image proportionally to fit within page minus margins
- No server involvement — all in browser

---

## Tool 4 — PDF to Images

**Page:** `src/pages/pdf-to-images.astro`

### Input
- 1 PDF file via DropZone (single)

### Options
- **Resolution slider**: 72–300 DPI, default 150
  - Renders each page at `scale = dpi / 72` on a canvas
- **Format toggle**: PNG (default) / JPG
  - PNG: lossless, larger files, better for text
  - JPG: smaller files, better for photos
- JPG quality slider (shown when JPG selected): 60–100%, default 85%

### Output
- ZIP file containing one image per page, named `page-001.png` etc.
- Uses `jszip` to bundle, `saveAs` to download

### Implementation notes
- PDF.js renders each page to an off-screen canvas
- Canvas `.toBlob()` exports to PNG or JPG
- Web Worker prevents UI freeze on large PDFs

---

## Tool 5 — Reorder & Delete Pages

**Page:** `src/pages/reorder-pdf.astro`

### Input
- 1 PDF file via DropZone (single)

### UI
- ThumbnailGrid: each card shows a rendered thumbnail of the page + page number
- Drag cards to reorder
- ✕ button removes a page
- Live count: "X of Y pages"

### Output
- PDF with pages in the new order, deleted pages removed

### Implementation notes
- PDF.js renders thumbnails (small scale ~0.3) for the grid
- On "Generate PDF": `pdf-lib` loads the original PDF, uses `copyPages` + `addPage` in the new order
- Deleted pages are simply not included

---

## Tool 6 — Merge PDFs

**Page:** `src/pages/merge-pdf.astro`

### Input
- N PDF files via DropZone (multiple)
- File list with drag-and-drop reordering (order = merge order)

### Output
- Single merged PDF (`merged.pdf`)

### Implementation notes
- `pdf-lib` `PDFDocument.create()`, then `copyPages` from each source document in order
- Each source loaded with `PDFDocument.load(arrayBuffer)`

---

---

## Tool 7 — PDF Text Extractor

**Page:** `src/pages/pdf-text-extractor.astro`

### Purpose
Extract text from scanned or image-only PDFs using on-device OCR. Intended for PDFs that have no embedded text layer.

### Input
- 1 scanned PDF via DropZone (single)
- Language picker: 9 predefined chips (EN, FR, DE, ES, IT, RU, JA, ZH-Simplified) + searchable dropdown of ~75 additional Tesseract languages; multi-select supported for bilingual documents

### Pipeline
1. PDF.js renders each page to an off-screen canvas at 2× scale (~144 DPI — optimal for Tesseract)
2. Tesseract.js Web Worker processes each canvas sequentially
3. Text assembled page-by-page with per-page progress reported

### Output & Actions
- Scrollable text panel (monospace, paginated with `Page N` separators)
- **Copy all** — full text to clipboard
- **Download text PDF** — clean A4 PDF via pdf-lib (Helvetica, Latin only; non-Latin characters replaced with `?`, notice page appended if relevant)
- **Download .md** — Markdown with `## Page N` headings and `---` dividers; full Unicode

### External CDN requests (first use only, then browser-cached)
- Tesseract.js WASM core: `cdn.jsdelivr.net/npm/tesseract.js-core@6`
- Tesseract.js worker script: `cdn.jsdelivr.net/npm/tesseract.js@6`
- Language training data: `tessdata.projectnaptha.com/4.0.0` (~8–20 MB per language)

### Libraries
| Package | License | Role |
|---|---|---|
| `tesseract.js` | Apache 2.0 | OCR engine (C++ Tesseract compiled to WASM) |
| `pdfjs-dist` | Apache 2.0 | Render PDF pages to canvas |
| `pdf-lib` | MIT | Generate the text PDF output |

---

## Privacy Note

All PDF processing happens in the browser using JavaScript. No file is ever uploaded to a server. PDF.js and pdf-lib run entirely client-side.

The PDF Text Extractor additionally downloads Tesseract OCR components from external CDNs on first use — see the Datenschutzerklärung for full disclosure.

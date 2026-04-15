# tools.florianabry.me

A collection of small, self-contained web tools that run entirely in the browser. No file is ever uploaded to a server — all processing happens client-side.

**Live site:** [tools.florianabry.me](https://tools.florianabry.me)

---

## Tools

### PDF
| Tool | Description |
|---|---|
| [Images to PDF](https://tools.florianabry.me/images-to-pdf) | Combine images into a single PDF. Drag to reorder, choose A4/Letter or fit-to-image page size. |
| [PDF to Images](https://tools.florianabry.me/pdf-to-images) | Export each page of a PDF as PNG or JPG. Resolution slider (72–300 DPI), downloaded as ZIP. |
| [Reorder & Delete Pages](https://tools.florianabry.me/reorder-pdf) | Drag-and-drop page thumbnail grid to reorder or remove pages, then download the result. |
| [Merge PDFs](https://tools.florianabry.me/merge-pdf) | Combine multiple PDF files into one in any order. |

### QR Code
| Tool | Description |
|---|---|
| [QR Code Generator](https://tools.florianabry.me/qr-generator) | Generate a styled QR code — 4 dot styles, split outer/inner corner colors, transparent background, center logo, PNG (300/600/1024 px) or SVG export. Live preview. |
| [QR Code Reader](https://tools.florianabry.me/qr-reader) | Upload an image containing a QR code to decode it. |

### Productivity
| Tool | Status | Description |
|---|---|---|
| [Offline Examiner Tracker](https://tools.florianabry.me/offline-examiner-tracker) | Live | Excel spreadsheet for EPO patent examiners — tracks productivity goals accounting for actual vacation days. Download and run locally. |
| Online Examiner Tracker | Coming soon | Browser-based version with persistent cloud storage via Google Drive OAuth — no server. |

### Markdown *(coming soon)*
| Tool | Description |
|---|---|
| Markdown Converter | Convert Markdown to HTML, PDF, or plain text — entirely in the browser. |

---

## Stack

- **[Astro](https://astro.build)** — static site generator, output: pure HTML/CSS/JS
- **[Tailwind CSS v4](https://tailwindcss.com)** + **[DaisyUI v5](https://daisyui.com)** — styling and components
- **[pdf-lib](https://pdf-lib.js.org)** — create, merge, reorder PDFs
- **[PDF.js](https://mozilla.github.io/pdf.js/)** — render PDF pages to canvas (with Web Worker)
- **[JSZip](https://stuk.github.io/jszip/)** — bundle image exports into ZIP
- **[qr-code-styling](https://github.com/kozakdenys/qr-code-styling)** — QR code generation with styling
- **[jsQR](https://github.com/cozmo/jsQR)** — QR code decoding

## Privacy

All tools process data entirely in the browser. Files are never uploaded to any server. PDF and image processing runs locally using JavaScript and WebAssembly.

---

## Development

```bash
npm install       # Install dependencies
npm run dev       # Start dev server at http://localhost:4321
npm run build     # Build to ./dist/
npm run preview   # Preview production build locally
```

## Deployment

Pushing to `main` triggers a GitHub Actions workflow that builds the site and deploys `./dist/` to OVH static hosting via FTP.

Required repository secrets: `PROD_HOST`, `PROD_USER`, `PROD_PASS`, `PROD_PATH`.

---

## Issues

Found a bug or want to suggest a tool? [Open an issue](https://github.com/florian-naity/tools/issues).

# Plan: Markdown Tools — Document Converter + Editor

## Context

The site's Markdown section currently has one "coming soon" card with no backing page. This plan adds two fully-functional tools under the sky accent color, consistent with the existing design system. The goal is to support AI-workflow document prep (PDF/DOCX → Markdown) and a bidirectional rich-text ↔ Markdown editor for writing and pasting from email/Word.

---

## New npm dependencies

```bash
npm install mammoth marked jspdf turndown @tiptap/core @tiptap/starter-kit @tiptap/extension-markdown
```

| Package | Purpose | License |
|---|---|---|
| `mammoth` | DOCX → Markdown | BSD-2-Clause |
| `marked` | Markdown → HTML (preview + MD→rich sync) | MIT |
| `jspdf` | PDF export from rendered HTML | MIT |
| `turndown` | HTML → Markdown (for .html file input in Tool 1) | MIT |
| `@tiptap/core` | WYSIWYG editor engine (ProseMirror-based) | MIT |
| `@tiptap/starter-kit` | Headings, bold, italic, lists, code, blockquote | MIT |
| `@tiptap/extension-markdown` | Markdown serialisation/deserialisation in Tiptap | MIT |
| `@tiptap/extension-link` | Hyperlink support with URL prompt | MIT |
| `@tiptap/extension-table` + `-table-row` + `-table-cell` + `-table-header` | Table insert/edit; serialises to GFM pipe-table syntax | MIT |

---

## Tool 1 — Document to Markdown (`/document-to-markdown`)

**File**: `src/pages/document-to-markdown.astro`

### Input
- `DropZone` component, `accept=".pdf,.docx,.html,.htm"`, single file
- Format auto-detected from file extension

### Pipeline

**PDF** (text-based only):
1. Import `pdfjs-dist` (already installed), set worker to `/vendor/pdf.worker.min.mjs`
2. Load file as ArrayBuffer → `pdfjsLib.getDocument()`
3. Iterate pages → `page.getTextContent()` — returns text items with position + font data
4. Custom markdown reconstruction:
   - Group items into lines by y-position proximity
   - Detect headings by font size relative to body average (e.g. ≥1.4× → `#`, ≥1.2× → `##`)
   - Detect bullet items by leading `•` / `-` / digit+`.`
   - Join remaining lines as paragraphs (blank line between groups)
5. Prepend front matter: `# {filename}` + blank line

**DOCX**:
1. Import `mammoth` (npm)
2. `mammoth.convertToMarkdown({ arrayBuffer })` → direct markdown output

**HTML / HTM** (saved web pages, email exports):
1. Read file as text → parse with `DOMParser` (built-in browser API, no library)
2. Strip `<script>`, `<style>`, `<nav>`, `<footer>` elements (noise reduction)
3. Pass cleaned `document.body` to `turndown` → clean markdown output
4. Note: `.epub` is a future candidate (it's a ZIP of HTML files; `jszip` is already installed)

### Output panel (right column)
- Tab toggle: **Preview** (rendered via `marked`) | **Source** (raw markdown in scrollable `<pre>`)
- Action row: `[Copy]` `[Download .md]` `[Download as PDF]`
- "Download as PDF": parse markdown with `marked` → inject into a hidden styled `<div>` → `jsPDF.html()` → save

### Layout
```
┌───────────────────┬───────────────────────────────┐
│  DropZone         │  [Preview] [Source]            │
│  .pdf, .docx      │                                │
│                   │  ...rendered or raw output...  │
│                   │                                │
│                   │  [Copy] [↓ .md] [↓ PDF]        │
└───────────────────┴───────────────────────────────┘
Mobile: stacked, dropzone on top
```

### Design tokens
- Accent: `sky-500` / `sky-400`
- Icon bg: `bg-sky-500/10 border-sky-500/25`
- Section label: `text-sky-400`
- Input card border: `border-sky-500/20`, gradient from `from-sky-500/5`

### Attribution footer
- Right: "Powered by pdf.js (Apache 2.0) and mammoth.js (BSD-2-Clause)."

---

## Tool 2 — Markdown Editor (`/markdown-editor`)

**File**: `src/pages/markdown-editor.astro`

### Architecture — bidirectional real-time sync

```
LEFT PANE                     RIGHT PANE
Tiptap WYSIWYG  ──update──►  textarea (raw markdown)
                              (via editor.storage.markdown.getMarkdown())

textarea input  ──debounced──► Tiptap
(300 ms)                       (via editor.commands.setContent(mdText))
```

Lock flag (`syncing = true/false`) prevents feedback loops when one side drives the other.

### Left pane (Tiptap WYSIWYG)
- Extensions: `StarterKit` (headings H1–H3, bold, italic, bullet list, ordered list, blockquote, code, horizontal rule) + `Markdown` extension
- Paste: Tiptap handles rich HTML paste natively; Markdown extension serialises it to markdown automatically
- Placeholder text: "Write or paste here — rich text, email, or a Word document…"

### Right pane (textarea)
- Monospace font, full height
- Placeholder: "Or write Markdown here — formatted output appears on the left…"
- On `input` (debounced 300 ms): call `editor.commands.setContent(value)` with lock flag

### Toolbar (above both panes, one strip)
| Group | Buttons |
|---|---|
| Format | **B** *I* |
| Headings | H1 H2 H3 |
| Structure | — (HR) `"` (blockquote) `` ` `` (code) |
| Lists | ≡ (bullet) 1. (ordered) |
| Insert | 🔗 (link — opens inline URL prompt) · ⊞ (table — inserts default 3×3, with add/remove row/col controls in context menu) |
| Export | `[Copy MD]` `[Copy HTML]` `[↓ .md]` `[↓ PDF]` |

Link UX: clicking 🔗 when text is selected wraps it in a link; a small popover appears to enter/edit/remove the URL.
Table UX: inserts a 3-column × 3-row GFM table; right-click (or a floating mini-toolbar) exposes add row, add column, delete row, delete column.

Export logic:
- **Copy MD**: `navigator.clipboard.writeText(markdownText)`
- **Copy HTML**: `navigator.clipboard.writeText(marked.parse(markdownText))` — plain semantic HTML (`<h2>`, `<strong>`, `<table>` etc.), no inline styles; email clients (Gmail, Outlook) render these with their own defaults, which is sufficient for this use case
- **Download .md**: Blob + object URL + `<a download>`
- **Download PDF**: `marked.parse(md)` → inject into hidden styled div → `jsPDF.html()` → save. Fallback for long documents: if jsPDF pagination is unreliable, open a styled `window.print()` popup instead (no extra library, browser handles page breaks natively)

### Layout
```
DESKTOP (≥ 768px):
┌────────────────────────────────────────────────────────┐
│ B I | H1 H2 H3 | — " ` | ≡ 1. | [MD] [HTML] [.md] [PDF]│
├────────────────────────────┬───────────────────────────┤
│  Rich Text (Tiptap)        │  Markdown source           │
│  prose, editable           │  monospace textarea        │
│  min-height: 60vh          │  min-height: 60vh          │
└────────────────────────────┴───────────────────────────┘

MOBILE (< 768px):
Toolbar wraps. Panes stack vertically, each min-height: 40vh.
Label chips above each pane: "Rich Text" | "Markdown".
```

### Design tokens
- Same sky accent as Tool 1
- Tiptap editor: `prose prose-invert` styling scoped to left pane
- Textarea right pane: `bg-base-100 font-mono text-sm`

### Attribution footer
- Right: "Editor powered by Tiptap (MIT) and marked (MIT)."

---

## Home page changes

**File**: `src/pages/index.astro`

Update the `Markdown` group's tools array:

```js
tools: [
  {
    title: 'Document to Markdown',
    description: 'Convert PDFs and Word docs to clean Markdown — ideal for AI workflows and Obsidian vaults.',
    href: '/document-to-markdown',
    icon: '📄',
  },
  {
    title: 'Markdown Editor',
    description: 'Paste rich text and get Markdown instantly, or write Markdown and copy formatted HTML.',
    href: '/markdown-editor',
    icon: '✍️',
  },
]
```

Remove the old single `markdown-converter` entry (href `/markdown-converter`) and the `badge: 'coming soon'`.

---

## Verification

No formal test vectors — the conversion logic is delegated entirely to well-tested third-party libraries (Tiptap, marked, mammoth, pdfjs-dist). Verification is manual and visual.

### Smoke test document for Tool 2
Paste this into the right (Markdown) pane and verify round-trip fidelity in the left pane:

```markdown
# Heading 1
## Heading 2

Normal paragraph with **bold**, *italic*, and a [link](https://example.com).

| Column A | Column B | Column C |
|---|---|---|
| Row 1 | $1,000–2,000 | ≥120 dB |
| Row 2 | ~17% CAGR | 3× faster |

- Bullet item one
- Bullet item two

1. Ordered item one
2. Ordered item two

> Blockquote text here.

`inline code` and a horizontal rule below:

---
```

### Checklist
1. `npm run dev` → http://localhost:4321
2. Home page → Markdown section shows two new tool cards, no "coming soon" badge
3. **Tool 1 — PDF**: upload a text-based PDF → markdown preview renders → download .md → download PDF
4. **Tool 1 — DOCX**: upload a .docx file → markdown output appears correctly
5. **Tool 1 — HTML**: upload a saved .html webpage → stripped and converted to clean markdown
6. **Tool 2 — smoke test**: paste the smoke test document above into right pane → left pane reflects all elements (heading, bold, italic, link, table, lists, blockquote, code, HR) in real time
7. **Tool 2 — reverse**: type rich text in left pane → markdown appears correctly in right pane
8. **Tool 2 — paste from clipboard**: copy formatted content from a webpage → paste into left pane → markdown serialises correctly
9. **Tool 2 — exports**: all four buttons work (Copy MD, Copy HTML, Download .md, Download PDF); pasted HTML survives in Gmail compose
10. Mobile (375px): panes stack, toolbar wraps without overflow, both panes usable
11. Design check: sky accent colour, animation delays, back-link, privacy footer match other tool pages

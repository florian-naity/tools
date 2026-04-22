# SEO & Indexing Best Practices for Static Tool Sites

Applicable to any static site (Astro, Next.js, plain HTML) hosting browser-based utilities.

---

## 1. Sitemap

Generate and submit a `sitemap.xml` so Googlebot has a complete map of your pages.

- For Astro: install `@astrojs/sitemap`, set `site` in `astro.config.mjs`, and add the integration. A `sitemap-index.xml` + `sitemap-0.xml` pair is auto-generated on build.
- Add `<link rel="sitemap" href="/sitemap-index.xml">` in `<head>`.
- Submit the sitemap URL in [Google Search Console](https://search.google.com/search-console) → Indexing → Sitemaps.
- On Apache/OVH hosting, add `AddType application/xml .xml` to `.htaccess` — some hosts won't serve XML without an explicit MIME type.

## 2. robots.txt

Place a `robots.txt` at the webroot. Even a permissive one signals the site is intentionally public.

```
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap-index.xml
```

## 3. Canonical Tag

Add `<link rel="canonical" href="...">` to every page using the full absolute URL. Prevents duplicate-content penalties when a page is indexed with/without `www`, with query strings, or via CDN variants.

```html
<link rel="canonical" href="https://yourdomain.com/page-slug" />
```

## 4. Open Graph & Twitter Card Tags

Required for correct social previews, and social signals indirectly feed back into rankings.

```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://yourdomain.com/page-slug" />
<meta property="og:title" content="Page Title — Site Name" />
<meta property="og:description" content="..." />
<meta property="og:site_name" content="yourdomain.com" />
<meta property="og:image" content="https://yourdomain.com/og-image.png" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Page Title — Site Name" />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="https://yourdomain.com/og-image.png" />
```

`og:image` should be 1200×630 px. Without it, social shares render poorly.

## 5. JSON-LD Structured Data

Embed a `<script type="application/ld+json">` block on every page so Google understands what the page *is*, not just what it says.

**Homepage** → `WebSite` schema:
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Site Name",
  "url": "https://yourdomain.com",
  "description": "..."
}
```

**Tool pages** → `SoftwareApplication` schema:
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Tool Name",
  "description": "...",
  "url": "https://yourdomain.com/tool-slug",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
```

## 6. Title Tags

Format: `{Keyword-rich tool name} — {Site Name}`

Rules:
- Lead with the primary search keyword, not a brand name.
- Keep under ~60 characters so it doesn't get truncated in SERPs.
- Include the strongest differentiator in the title itself (e.g. "Free", "No Upload", "Online").

Examples:
| Weak | Strong |
|---|---|
| `PDF Tool — mysite.com` | `Merge PDFs Online — Free, No Upload` |
| `QR Generator` | `Free QR Code Generator — Custom QR Codes Online` |
| `Markdown Editor` | `Free Markdown Editor — Rich Text to Markdown Converter` |

## 7. Meta Descriptions

Not a direct ranking factor, but controls click-through rate from SERPs — which *is* a signal.

Rules:
- 140–160 characters.
- Restate the primary keyword naturally.
- Lead with what the tool does, then mention the privacy/no-upload angle if relevant.
- Every page should have a unique description.

## 8. On-Page Content

The biggest gap for tool sites: pages are mostly UI with minimal text, so there's little for Google to index or rank.

Add to each tool page:
- A short "How it works" section (2–3 sentences minimum).
- A "Why use this" or feature list paragraph.
- An FAQ section — Google renders FAQ schema as rich results in SERPs.

FAQ JSON-LD:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is this tool free?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes, completely free." }
    }
  ]
}
```

## 9. Differentiator Keywords

For privacy-first / client-side tools, the following phrases are actively searched and underused by competitors:

- `no upload`
- `runs in your browser`
- `without uploading`
- `offline`
- `no account`
- `free`

Use them in titles, descriptions, and body copy — not just in the privacy notice footer.

## 10. Backlinks (Off-Page)

Technical SEO gets Googlebot in the door; backlinks build the authority that makes it rank.

High-leverage, low-effort submissions for tool sites:
- [AlternativeTo](https://alternativeto.net) — list each tool individually
- [Product Hunt](https://producthunt.com) — launch the site
- Hacker News "Show HN" post
- Tool directory sites (e.g. Uneed, Toools.design, etc.)

## 11. Google Search Console

After every major deployment:
1. Go to Search Console → URL Inspection → paste the URL → "Request indexing" for new or updated pages.
2. Monitor Coverage report for crawl errors.
3. Check the Sitemaps report to confirm the sitemap was fetched successfully.

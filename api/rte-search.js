// api/rte-search.js
// Proxy search requests to RecipeTin Eats to avoid CORS issues on the client side.
// Usage: GET /api/rte-search?q=chicken+pasta

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const q = ((req.query && req.query.q) || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing query parameter ?q=' });

  try {
    const searchUrl = `https://www.recipetineats.com/?s=${encodeURIComponent(q)}`;

    const resp = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    });

    if (!resp.ok) {
      return res.status(502).json({ error: `RecipeTin Eats returned HTTP ${resp.status}` });
    }

    const html = await resp.text();
    const results = parseSearchResults(html);

    return res.status(200).json({ results, count: results.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ---------------------------------------------------------------------------
// HTML parser — no external deps, regex-based on WordPress structure
// ---------------------------------------------------------------------------

function parseSearchResults(html) {
  const results = [];
  const seen = new Set();

  // WordPress article cards — each search result is wrapped in <article>
  const articleRe = /<article\b[^>]*>([\s\S]*?)<\/article>/gi;
  let m;

  while ((m = articleRe.exec(html)) !== null) {
    if (results.length >= 10) break;
    const art = m[1];

    // ── Title & URL ──────────────────────────────────────────────
    // WordPress: <h2 class="entry-title"><a href="…">Title</a></h2>
    const titleM =
      art.match(
        /<h\d[^>]*>\s*<a[^>]+href="(https?:\/\/(?:www\.)?recipetineats\.com\/[^"?#]+)"[^>]*>([\s\S]*?)<\/a>/i,
      );
    if (!titleM) continue;

    const url = titleM[1].replace(/\/$/, '');
    if (seen.has(url)) continue;
    seen.add(url);

    const title = titleM[2].replace(/<[^>]+>/g, '').trim();
    if (!title) continue;

    // Skip taxonomy / pagination pages
    if (/\/(category|tag|author|page)\//.test(url)) continue;

    // ── Thumbnail ────────────────────────────────────────────────
    let thumbnail = null;

    // Collect all <img> tags from the article
    const imgTags = [...art.matchAll(/<img\b[^>]+>/gi)].map((x) => x[0]);
    for (const imgTag of imgTags) {
      // Prefer lazy-load attributes
      for (const attr of ['data-lazy-src', 'data-src', 'data-original']) {
        const attrM = imgTag.match(
          new RegExp(`${attr}="(https?://[^"]+\\.(?:jpg|jpeg|png|webp)(?:\\?[^"]*)?)"`, 'i'),
        );
        if (attrM && !attrM[1].includes('placeholder')) {
          thumbnail = attrM[1];
          break;
        }
      }
      if (thumbnail) break;

      // Fall back to src
      const srcM = imgTag.match(
        /src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)(?:\?[^"]*)?)"/i,
      );
      if (srcM && !srcM[1].includes('data:') && !srcM[1].includes('placeholder')) {
        // Prefer images hosted on RTE or a CDN (not tiny site icons)
        if (srcM[1].length > 30) {
          thumbnail = srcM[1];
          break;
        }
      }
    }

    // ── Excerpt ──────────────────────────────────────────────────
    let excerpt = '';
    const excM = art.match(
      /<div[^>]*class="[^"]*(?:entry-summary|post-excerpt|excerpt)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    );
    if (excM) {
      excerpt = excM[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (excerpt.length > 160) excerpt = excerpt.substring(0, 160) + '…';
    }

    results.push({ title, url, thumbnail, excerpt });
  }

  return results;
}

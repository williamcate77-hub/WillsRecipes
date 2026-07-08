const ALLOWED_HOSTS = new Set(['recipetineats.com', 'www.recipetineats.com']);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const raw = ((req.query && req.query.url) || '').trim().slice(0, 500);
  // Strict allowlist: parse the URL and check the exact hostname, so
  // lookalikes (recipetineats.com.evil.com, evil.com/?recipetineats.com) are rejected.
  let target;
  try { target = new URL(raw); } catch { return res.status(400).json({ error: 'Missing or invalid ?url=' }); }
  if (target.protocol !== 'https:' || !ALLOWED_HOSTS.has(target.hostname)) {
    return res.status(400).json({ error: 'Missing or invalid ?url=' });
  }
  try {
    const resp = await fetch(target.href, {
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });
    // redirects are followed (the site 301s non-trailing-slash URLs) but must land on an allowed host
    if (!ALLOWED_HOSTS.has(new URL(resp.url).hostname)) {
      return res.status(400).json({ error: 'Missing or invalid ?url=' });
    }
    const html = await resp.text();
    const recipe = parseRecipe(html, target.href);
    res.status(200).json({ recipe });
  } catch (e) {
    console.error('rte-recipe failed:', e);
    res.status(502).json({ error: 'Could not fetch that recipe' });
  }
};

function parseRecipe(html, url) {
  // Try JSON-LD first (most reliable)
  const ldMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  if (ldMatch) {
    for (const block of ldMatch) {
      try {
        const json = block.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
        const data = JSON.parse(json);
        const items = Array.isArray(data) ? data : (data['@graph'] || [data]);
        for (const item of items) {
          if (item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
            return {
              title: item.name || '',
              servings: item.recipeYield ? String(item.recipeYield).replace(/[^\d]/g, '') : null,
              ingredients: (item.recipeIngredient || []).map(s => s.trim()),
              steps: (item.recipeInstructions || []).map(s => typeof s === 'string' ? s : (s.text || '')).filter(Boolean),
              url
            };
          }
        }
      } catch(e) {}
    }
  }
  // Fallback: parse WPRM ingredient blocks
  const ingredients = [];
  const ingRe = /class="wprm-recipe-ingredient[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = ingRe.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) ingredients.push(text);
  }
  const titleM = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = titleM ? titleM[1].replace(/<[^>]+>/g, '').trim() : '';
  return { title, servings: null, ingredients, steps: [], url };
}

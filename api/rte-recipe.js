// api/rte-recipe.js
// Fetches an individual RecipeTin Eats recipe page and extracts structured data.
// Primarily uses schema.org JSON-LD (most reliable), with WPRM markup as fallback.
// Usage: GET /api/rte-recipe?url=https://www.recipetineats.com/...

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = ((req.query && req.query.url) || '').trim();
  if (!url) return res.status(400).json({ error: 'Missing query parameter ?url=' });

  // Only proxy RecipeTin Eats URLs
  if (!url.includes('recipetineats.com')) {
    return res.status(400).json({ error: 'Only recipetineats.com URLs are supported' });
  }

  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
      },
    });

    if (!resp.ok) {
      return res.status(502).json({ error: `Recipe page returned HTTP ${resp.status}` });
    }

    const html = await resp.text();
    const recipe = parseRecipe(html, url);

    if (!recipe) {
      return res.status(404).json({ error: 'Could not find recipe data on this page' });
    }

    return res.status(200).json({ recipe });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ---------------------------------------------------------------------------
// Recipe parser — JSON-LD first, WPRM markup as fallback
// ---------------------------------------------------------------------------

function parseRecipe(html, sourceUrl) {
  // ── JSON-LD (preferred) ────────────────────────────────────────────────────
  const jsonLdRe = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;

  while ((m = jsonLdRe.exec(html)) !== null) {
    let raw;
    try {
      raw = JSON.parse(m[1].trim());
    } catch {
      continue;
    }

    // Handle @graph wrapper (common in Yoast SEO output)
    let data = null;
    if (raw && raw['@graph'] && Array.isArray(raw['@graph'])) {
      data = raw['@graph'].find((node) => isRecipeType(node));
    } else if (isRecipeType(raw)) {
      data = raw;
    }
    if (!data) continue;

    const title = (data.name || '').trim();
    if (!title) continue;

    // Ingredients — recipeIngredient is an array of strings
    const ingredients = Array.isArray(data.recipeIngredient)
      ? data.recipeIngredient.map((s) => s.trim()).filter(Boolean)
      : [];

    if (!ingredients.length) continue;

    // Servings
    let servings = null;
    if (data.recipeYield) {
      const yieldVal = Array.isArray(data.recipeYield)
        ? data.recipeYield[0]
        : data.recipeYield;
      const numM = String(yieldVal).match(/\d+/);
      if (numM) servings = parseInt(numM[0], 10);
    }

    // Steps
    const steps = [];
    if (data.recipeInstructions) {
      flattenInstructions(data.recipeInstructions, steps);
    }

    return { title, ingredients, servings, steps, url: sourceUrl };
  }

  // ── WPRM fallback (WP Recipe Maker plugin) ────────────────────────────────
  return parseWprm(html, sourceUrl);
}

function isRecipeType(node) {
  if (!node || !node['@type']) return false;
  const t = node['@type'];
  return t === 'Recipe' || (Array.isArray(t) && t.includes('Recipe'));
}

function flattenInstructions(instr, out) {
  if (typeof instr === 'string') {
    const s = instr.replace(/<[^>]+>/g, '').trim();
    if (s) out.push(s);
    return;
  }
  if (!Array.isArray(instr)) return;
  for (const item of instr) {
    if (typeof item === 'string') {
      const s = item.replace(/<[^>]+>/g, '').trim();
      if (s) out.push(s);
    } else if (item['@type'] === 'HowToStep') {
      const s = ((item.text || item.name || '')).replace(/<[^>]+>/g, '').trim();
      if (s) out.push(s);
    } else if (item['@type'] === 'HowToSection' && Array.isArray(item.itemListElement)) {
      // Section heading followed by its steps
      if (item.name) out.push(`── ${item.name} ──`);
      flattenInstructions(item.itemListElement, out);
    }
  }
}

function parseWprm(html, sourceUrl) {
  const titleM = html.match(/<span[^>]*class="[^"]*wprm-recipe-name[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
  const title = titleM ? titleM[1].replace(/<[^>]+>/g, '').trim() : '';

  const ingItems = [];
  const ingRe = /<li[^>]*class="[^"]*wprm-recipe-ingredient\b[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  let ingM;
  while ((ingM = ingRe.exec(html)) !== null) {
    const txt = ingM[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (txt) ingItems.push(txt);
  }

  if (!title || !ingItems.length) return null;

  return { title, ingredients: ingItems, servings: null, steps: [], url: sourceUrl };
}

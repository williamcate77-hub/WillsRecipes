module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const url = ((req.query && req.query.url) || '').trim();
  if (!url || !url.includes('recipetineats.com')) return res.status(400).json({ error: 'Missing or invalid ?url=' });
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });
    const html = await resp.text();
    const recipe = parseRecipe(html, url);
    res.status(200).json({ recipe });
  } catch (e) {
    res.status(500).json({ error: e.message });
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

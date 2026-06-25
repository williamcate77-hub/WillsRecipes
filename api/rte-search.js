module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const q = ((req.query && req.query.q) || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing ?q=' });
  try {
    const url = `https://www.recipetineats.com/?s=${encodeURIComponent(q)}`;
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-AU,en;q=0.9',
      }
    });
    const html = await resp.text();
    const results = parseResults(html);
    res.status(200).json({ results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

function parseResults(html) {
  const results = [];
  const seen = new Set();
  const articleRe = /<article\b[^>]*>([\s\S]*?)<\/article>/gi;
  let m;
  while ((m = articleRe.exec(html)) !== null) {
    if (results.length >= 12) break;
    const art = m[1];
    const titleM = art.match(/<h\d[^>]*>\s*<a[^>]+href="(https?:\/\/(?:www\.)?recipetineats\.com\/[^"?#]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!titleM) continue;
    const url = titleM[1].replace(/\/$/, '');
    if (seen.has(url) || /\/(category|tag|author|page)\//.test(url)) continue;
    seen.add(url);
    const title = titleM[2].replace(/<[^>]+>/g, '').trim();
    if (!title) continue;
    let thumbnail = null;
    const imgM = art.match(/(?:data-lazy-src|data-src|src)="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
    if (imgM && !imgM[1].includes('placeholder') && !imgM[1].includes('data:')) thumbnail = imgM[1];
    let excerpt = '';
    const excM = art.match(/<div[^>]*class="[^"]*(?:entry-summary|excerpt)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (excM) excerpt = excM[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 150);
    results.push({ title, url, thumbnail, excerpt });
  }
  return results;
}

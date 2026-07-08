// Recipe data validation — run with: npm run validate
// Exits non-zero if any ERROR is found. Warnings are informational.

const path = require('path');
const { estimateCaloriesPerServe } = require('./nutrition');
const { CATEGORIES, RECIPES } = require(path.join(__dirname, '..', 'recipes.js'));

const BANDS = {
  'Dips & Starters': [60, 250], 'Salads': [150, 550], 'Soups': [100, 450],
  'Seafood': [150, 750], 'Meat & Poultry': [300, 750], 'Vegetarian': [250, 750],
  'Pasta & Rice': [300, 750], 'Sides': [80, 400], 'Bread & Bakes': [100, 500],
  'Sauces & Condiments': [20, 200], 'Desserts': [200, 600],
};

const TIME_RE = /^\d+ (min|hr|days?)( \d+ min)?( \+ .+)?$/;
const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

const errors = [];
const warnings = [];
const err = (r, msg) => errors.push(`#${r.id} ${r.name}: ${msg}`);
const warn = (r, msg) => warnings.push(`#${r.id} ${r.name}: ${msg}`);

// ── uniqueness
const seenIds = new Map();
const seenNames = new Map();
for (const r of RECIPES) {
  if (typeof r.id !== 'number' || !Number.isInteger(r.id)) err(r, `id is not an integer: ${r.id}`);
  if (seenIds.has(r.id)) err(r, `duplicate id (also #${seenIds.get(r.id)})`);
  seenIds.set(r.id, r.id);
  const nameKey = (r.name || '').toLowerCase().trim();
  if (seenNames.has(nameKey)) err(r, `duplicate name (also #${seenNames.get(nameKey)})`);
  seenNames.set(nameKey, r.id);
}

// ── near-duplicate names (catches re-added recipes with reworded titles)
const norm = n => n.toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/).filter(w => w.length > 2);
for (let i = 0; i < RECIPES.length; i++) {
  for (let j = i + 1; j < RECIPES.length; j++) {
    if (RECIPES[i].category !== RECIPES[j].category) continue;
    const a = norm(RECIPES[i].name), b = norm(RECIPES[j].name);
    if (!a.length || !b.length) continue;
    const inter = a.filter(w => b.includes(w)).length;
    if (inter / Math.min(a.length, b.length) < 0.9) continue;
    // similar names: treat as duplicate only if the ingredient lists also overlap heavily
    const ingsOf = r => new Set(r.ingredients.filter(x => !x.section).map(x => x.name.toLowerCase().split(',')[0].trim()));
    const ia = ingsOf(RECIPES[i]), ib = ingsOf(RECIPES[j]);
    // one recipe embedding another as a component (dish + its sauce) is fine —
    // only compare lists of similar size
    if (Math.min(ia.size, ib.size) / Math.max(ia.size, ib.size) < 0.6) continue;
    const overlap = [...ia].filter(x => ib.has(x)).length / Math.min(ia.size, ib.size);
    if (overlap >= 0.6) err(RECIPES[i], `likely duplicate of #${RECIPES[j].id} "${RECIPES[j].name}" (${Math.round(overlap * 100)}% ingredient overlap)`);
  }
}

// ── field coverage + calories
for (const r of RECIPES) {
  if (!r.name || typeof r.name !== 'string') err(r, 'missing name');
  if (!CATEGORIES.includes(r.category)) err(r, `invalid category "${r.category}"`);
  if (!DIFFICULTIES.has(r.difficulty)) err(r, `invalid difficulty "${r.difficulty}"`);
  if (!(r.serves >= 1 && r.serves <= 12)) err(r, `serves out of range: ${r.serves}`);
  if (!TIME_RE.test(r.time || '')) err(r, `inconsistent time format: "${r.time}"`);
  if (!r.mainIngredient) err(r, 'missing mainIngredient');
  if (typeof r.caloriesPerServe !== 'number' || r.caloriesPerServe <= 0) err(r, `missing/invalid caloriesPerServe: ${r.caloriesPerServe}`);

  const ings = (r.ingredients || []).filter(i => !i.section);
  if (ings.length < 3) err(r, `only ${ings.length} ingredients (need >= 3)`);
  if ((r.steps || []).length < 3) err(r, `only ${(r.steps || []).length} steps (need >= 3)`);
  for (const i of ings) {
    if (!i.name || i.amount == null || typeof i.amount !== 'number' || !i.unit) {
      err(r, `incomplete ingredient: ${JSON.stringify(i)}`);
    } else if (i.amount <= 0) {
      err(r, `non-positive amount: ${JSON.stringify(i)}`);
    }
  }

  // calories: hard error only when the value fails its category band AND
  // an ingredient-based estimate disagrees — a value outside the band that the
  // estimate confirms is a genuinely light/rich dish, not a data error.
  const band = BANDS[r.category];
  if (band && typeof r.caloriesPerServe === 'number') {
    const [lo, hi] = band;
    const est = estimateCaloriesPerServe(r);
    const outOfBand = r.caloriesPerServe < lo || r.caloriesPerServe > hi;
    const disagrees = est.perServe > 0 && Math.abs(r.caloriesPerServe - est.perServe) / est.perServe > 0.4;
    if (outOfBand && disagrees) {
      err(r, `caloriesPerServe ${r.caloriesPerServe} outside ${r.category} band [${lo}-${hi}] and estimate says ~${est.perServe} (coverage ${(est.coverage * 100).toFixed(0)}%)`);
    } else if (outOfBand) {
      warn(r, `caloriesPerServe ${r.caloriesPerServe} outside band [${lo}-${hi}] but confirmed by estimate ~${est.perServe}`);
    }
  }
}

// ── report
console.log(`Validated ${RECIPES.length} recipes across ${CATEGORIES.length} categories.`);
const perCat = {};
RECIPES.forEach(r => perCat[r.category] = (perCat[r.category] || 0) + 1);
CATEGORIES.forEach(c => console.log(`  ${String(perCat[c] || 0).padStart(3)}  ${c}`));

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach(w => console.log('  WARN ' + w));
}
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  errors.forEach(e => console.error('  ERROR ' + e));
  process.exit(1);
}
console.log('\nAll checks passed.');

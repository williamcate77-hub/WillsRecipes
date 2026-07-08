// One-off v2 data migration (July 2026). Kept for provenance.
//
// Reads the original recipes.js + recipes2-4.js, then:
//  - normalises orphaned categories (Poultry, Sauces) and drops the Cocktails recipe
//  - removes duplicate recipes (11 pairs found by content comparison), keeping the
//    version with the more granular method
//  - normalises the time format to "N min" / "N hr[ M min]" (+ optional note)
//  - pads recipes with fewer than 3 method steps
//  - renames calories -> caloriesPerServe, correcting values that fail the
//    per-category sanity band AND disagree with an ingredient-based estimate
//  - writes a single consolidated recipes.js sorted by id
//
// Usage: node scripts/migrate-v2-data.js  (run from repo root, only works
// while the original four-file data layout is present)

const fs = require('fs');
const vm = require('vm');
const { estimateCaloriesPerServe } = require('./nutrition');

const SRC_FILES = ['recipes.js', 'recipes2.js', 'recipes3.js', 'recipes4.js'];
const src = SRC_FILES.map(f => fs.readFileSync(f, 'utf8')).join('\n') +
  ';__out = { CATEGORIES, all: [...RECIPES, ...RECIPES2, ...RECIPES3, ...RECIPES4] };';
const ctx = {};
vm.runInNewContext(src, ctx);
const { CATEGORIES, all } = ctx.__out;

// ── duplicates: delete these ids; DUPLICATE_ID_MAP (kept in app.js) maps them
//    to the surviving copy so saved recipes migrate cleanly.
const DELETE_IDS = new Set([
  266,            // Mandarin, Ginger & Turmeric Margarita (Cocktails — out of scope)
  251,            // dup of 192 Roast Tomato and Chickpea Dip
  253,            // dup of 194 Husband and Wife Smashed Cucumber Salad
  237,            // dup of 198 Stir-fried King Prawns
  236,            // dup of 199 Cantonese Wok-tossed Pipis
  221,            // dup of 257 Cracked Wheat and Freekeh Salad
  222,            // dup of 269 Harissa & Honey Roasted Mushroom Lentil Salad
  223,            // dup of 271 Roast and Raw Brussels Sprout Caesar
  224,            // dup of 272 Dukkah Cauliflower Salad
  225,            // dup of 268 Cioppino with Salsa Verde Fries
  226,            // dup of 267 Chicken Scarpariello
  227,            // dup of 270 Loaded Sweet Potatoes
]);

const CATEGORY_FIX = { 'Poultry': 'Meat & Poultry', 'Sauces': 'Sauces & Condiments' };

// Recipes where the calorie total from the ingredient list is credible but the
// serves count clearly is not (e.g. a 400 g chickpea + 80 g tahini platter
// "serving 2"). Correct serves, then derive caloriesPerServe from the estimate.
const SERVES_FIX = {
  4: 8,    // Loaded Spring Hummus — shared starter platter, not 2 portions
  6: 4,    // Grilled Haloumi with Babaganoush — 250 g haloumi starter for 4
  115: 10, // Roast Tomato & White Bean Raita — 780 g yoghurt + 400 g beans condiment
  163: 8,  // NY Pepperoni Pizza — 1 kg flour dough makes 2 pizzas
  192: 10, // Tomato Chickpea Dip with Naan — dip + full naan batch + curry butter
};

function normaliseTime(t) {
  let s = t.trim()
    .replace(/(\d+)\s*hours?\b/gi, '$1 hr')
    .replace(/(\d+)\s*minutes?\b/gi, '$1 min')
    .replace(/\s*\(including chill\)/i, ' + chill');
  // fold minutes >= 60 into hr+min
  s = s.replace(/^(\d+) min\b/, (m, n) => {
    n = parseInt(n, 10);
    if (n < 60) return m;
    const h = Math.floor(n / 60), r = n % 60;
    return r ? `${h} hr ${r} min` : `${h} hr`;
  });
  return s;
}

// Recipes with < 3 steps get their compound steps split / a finishing step added.
const STEP_FIXES = {
  111: ['Blend tahini, lemon juice, garlic, parsley and coriander with the water until very smooth and green.',
        'Adjust with more water for a pourable consistency or more lemon for brightness.',
        'Season with salt, taste and adjust before serving.'],
  112: ['Blend or whisk tahini, lemon juice and garlic together.',
        'Add the water gradually and keep blending until very smooth and silky. Add more water for a thinner consistency, more lemon for brightness.',
        'Season with salt, taste and adjust before serving.'],
  113: ['Stir yoghurt, garlic, sumac, lemon juice and olive oil together in a bowl.',
        'Season with salt and black pepper.',
        'Taste and adjust — more sumac for tang, more oil for richness.'],
  114: ['Mix yoghurt, lemon juice, lemon zest, garlic and herbs together.',
        'Season with salt and pepper to taste.',
        'Rest in the fridge for 10 minutes so the garlic and herbs infuse before serving.'],
  117: ['Blitz herbs, chilli, spices and half the olive oil together.',
        'Add remaining oil and blitz again to a loose, spoonable paste.',
        'Season to taste and store in the fridge under a thin layer of oil.'],
  160: ['Combine all ingredients in a bowl.',
        'Whisk until fully combined and the sugar has dissolved.',
        'Taste and adjust the balance — it should be salty, tangy and a little sweet.'],
};

// per-category calorie sanity bands (kcal per serve)
const BANDS = {
  'Dips & Starters': [60, 250], 'Salads': [150, 550], 'Soups': [100, 450],
  'Seafood': [150, 750], 'Meat & Poultry': [300, 750], 'Vegetarian': [250, 750],
  'Pasta & Rice': [300, 750], 'Sides': [80, 400], 'Bread & Bakes': [100, 500],
  'Sauces & Condiments': [20, 200], 'Desserts': [200, 600],
};

const kept = all.filter(r => !DELETE_IDS.has(r.id));
let calorieFixes = 0;

for (const r of kept) {
  if (CATEGORY_FIX[r.category]) r.category = CATEGORY_FIX[r.category];
  r.time = normaliseTime(r.time);
  if (STEP_FIXES[r.id]) r.steps = STEP_FIXES[r.id];

  if (r.id === 154) {
    // "Asian Greens Cooking Instructions": 10 bunches of each green for 8 was
    // a data-entry error — one bunch of each, serving 4, matches the method.
    r.ingredients.forEach(i => { if (!i.section) i.amount = 1; });
    r.serves = 4;
  }
  if (SERVES_FIX[r.id]) {
    const est = estimateCaloriesPerServe(r);
    console.log(`serves fix: #${r.id} ${r.name}: serves ${r.serves} -> ${SERVES_FIX[r.id]}, cal ${r.calories} -> ${Math.round(est.total / SERVES_FIX[r.id] / 10) * 10}`);
    r.serves = SERVES_FIX[r.id];
    r.calories = Math.round(est.total / r.serves / 10) * 10;
  }

  const [lo, hi] = BANDS[r.category];
  const est = estimateCaloriesPerServe(r);
  const stored = r.calories;
  const outOfBand = stored < lo || stored > hi;
  const disagrees = est.perServe > 0 && Math.abs(stored - est.perServe) / est.perServe > 0.4;
  let value = stored;
  if (outOfBand && disagrees) {
    value = Math.max(10, Math.round(est.perServe / 10) * 10);
    calorieFixes++;
    console.log(`cal fix: #${r.id} ${r.name} (${r.category}): ${stored} -> ${value} (est ${est.perServe}, coverage ${(est.coverage * 100).toFixed(0)}%)`);
  } else if (outOfBand) {
    console.log(`cal keep: #${r.id} ${r.name} (${r.category}): ${stored} outside band [${lo},${hi}] but estimate ${est.perServe} agrees`);
  }
  r.caloriesPerServe = value;
  delete r.calories;
}

kept.sort((a, b) => a.id - b.id);

// ── serialise back to a single JS data file
const q = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
function ingLine(i) {
  if (i.section) return `  {section:${q(i.section)}},`;
  const prep = i.prep ? `,prep:${q(i.prep)}` : '';
  return `  {name:${q(i.name)},amount:${i.amount},unit:${q(i.unit)}${prep}},`;
}
function recipeBlock(r) {
  return `{id:${r.id},name:${q(r.name)},category:${q(r.category)},difficulty:${q(r.difficulty)},serves:${r.serves},time:${q(r.time)},caloriesPerServe:${r.caloriesPerServe},mainIngredient:${q(r.mainIngredient)},
ingredients:[
${r.ingredients.map(ingLine).join('\n')}
],
steps:[
${r.steps.map(s => `  ${q(s)},`).join('\n')}
]}`;
}

const out = `// Cooking With Will — recipe data (single source of truth).
// Generated by scripts/migrate-v2-data.js; validate with: npm run validate
// caloriesPerServe is kcal per serve (the UI renders kJ first for AU readers).

const CATEGORIES = ['Dips & Starters','Salads','Soups','Seafood','Meat & Poultry','Vegetarian','Pasta & Rice','Sides','Bread & Bakes','Sauces & Condiments','Desserts'];

const RECIPES = [

${kept.map(recipeBlock).join(',\n\n')},

];
if (typeof module !== 'undefined') module.exports = { CATEGORIES, RECIPES };
`;

fs.writeFileSync('recipes.js.new', out);
console.log(`\nwrote recipes.js.new: ${kept.length} recipes (was ${all.length}), ${calorieFixes} calorie corrections`);

// Rough per-serve calorie estimation from ingredient lists.
// Used by scripts/validate.js to cross-check the caloriesPerServe field.
// Values are approximate (AU tbsp = 20 ml, cup = 250 ml); the goal is to
// catch order-of-magnitude data errors, not to be a nutrition database.

// kcal per 100 g. Longest matching keyword wins.
const KCAL_PER_100G = [
  // fats & oils
  ['extra virgin olive oil', 884], ['olive oil', 884], ['vegetable oil', 884], ['avocado oil', 884],
  ['sesame oil', 884], ['coconut oil', 892], ['neutral oil', 884], ['grapeseed oil', 884],
  ['chilli oil', 884], ['peanut oil', 884], ['canola oil', 884], ['sunflower oil', 884], ['oil', 884],
  ['ghee', 900], ['butter', 717], ['lard', 900], ['duck fat', 900],
  // dairy
  ['double cream', 449], ['thickened cream', 340], ['sour cream', 198], ['creme fraiche', 292],
  ['crème fraîche', 292], ['cream cheese', 342], ['fresh cream', 340], ['pouring cream', 340], ['cream', 340],
  ['greek yoghurt', 97], ['greek yogurt', 97], ['natural yoghurt', 61], ['plain yoghurt', 61],
  ['yoghurt', 61], ['yogurt', 61], ['buttermilk', 40], ['whole milk', 62], ['milk', 62],
  ['parmigiano', 431], ['parmesan', 431], ['pecorino', 387], ['grana padano', 398],
  ['mozzarella', 280], ['burrata', 330], ['bocconcini', 280], ['feta', 264], ['ricotta', 174],
  ['haloumi', 321], ['halloumi', 321], ['cheddar', 402], ['gruyere', 413], ['brie', 334],
  ['goats cheese', 364], ['goat cheese', 364], ['blue cheese', 353], ['mascarpone', 435],
  ['provolone', 351], ['cheese', 350], ['ice cream', 207],
  // eggs & proteins
  ['egg yolk', 322], ['egg white', 52], ['eggs', 143], ['egg', 143],
  ['chicken breast', 165], ['chicken thigh', 209], ['chicken wing', 203], ['chicken drumstick', 172],
  ['whole chicken', 215], ['chicken bone broth', 15], ['chicken stock', 5], ['chicken', 200],
  ['beef mince', 250], ['beef brisket', 250], ['beef cheek', 240], ['beef short rib', 290],
  ['scotch fillet', 230], ['eye fillet', 190], ['sirloin', 210], ['rump', 190], ['skirt steak', 220],
  ['flank steak', 190], ['steak', 217], ['beef', 230],
  ['lamb shoulder', 290], ['lamb leg', 230], ['lamb cutlet', 290], ['lamb mince', 280],
  ['lamb shank', 210], ['lamb', 260],
  ['pork belly', 518], ['pork shoulder', 260], ['pork mince', 260], ['pork fillet', 143],
  ['pork chop', 230], ['pork', 240],
  ['bacon', 417], ['pancetta', 458], ['prosciutto', 335], ['chorizo', 455], ['salami', 425],
  ['sausage', 300], ['ham', 145], ['duck', 337], ['turkey', 160], ['kangaroo', 98],
  // seafood
  ['smoked salmon', 117], ['salmon', 208], ['smoked trout', 117], ['trout', 148],
  ['tuna in oil', 190], ['tuna', 130], ['kingfish', 146], ['snapper', 100], ['barramundi', 92],
  ['dover sole', 91], ['ling', 90], ['flathead', 90], ['white fish', 105], ['fish fillet', 105],
  ['mackerel', 262], ['sardine', 208], ['anchov', 210], ['prawn', 99], ['shrimp', 99],
  ['scallop', 88], ['mussel', 86], ['clam', 86], ['pipis', 86], ['pipi', 86], ['oyster', 68],
  ['squid', 92], ['calamari', 92], ['octopus', 82], ['crab', 87], ['lobster', 89], ['fish', 105],
  ['tofu', 76], ['tempeh', 193],
  // grains, flours, breads
  ['self-raising flour', 350], ['self raising flour', 350], ['bread flour', 361], ['plain flour', 364],
  ['all-purpose flour', 364], ['rice flour', 366], ['almond meal', 571], ['almond flour', 571],
  ['semolina', 360], ['cornflour', 381], ['flour', 364],
  ['sourdough', 260], ['baguette', 270], ['ciabatta', 270], ['focaccia', 270], ['flatbread', 280],
  ['naan', 290], ['pita', 275], ['tortilla', 310], ['brioche', 345], ['bread', 265],
  ['panko', 370], ['breadcrumb', 395], ['crouton', 400],
  ['risotto rice', 350], ['arborio', 350], ['sushi rice', 350], ['brown rice', 362],
  ['wild rice', 357], ['steamed rice', 130], ['cooked rice', 130], ['rice', 360],
  ['spaghetti', 371], ['linguine', 371], ['penne', 371], ['rigatoni', 371], ['orecchiette', 371],
  ['macaroni', 371], ['lasagne sheet', 371], ['orzo', 371], ['risoni', 371], ['pasta', 371],
  ['rice noodle', 360], ['egg noodle', 385], ['soba', 336], ['udon', 337], ['vermicelli', 360],
  ['noodle', 350], ['couscous', 376], ['quinoa', 368], ['freekeh', 352], ['farro', 340],
  ['barley', 354], ['buckwheat', 343], ['cracked wheat', 342], ['bulgur', 342], ['polenta', 370],
  ['rolled oats', 389], ['oats', 389], ['granola', 450], ['puff pastry', 390], ['filo', 300],
  ['shortcrust', 450], ['pastry', 400],
  // legumes
  ['chickpea', 139], ['cooked lentil', 116], ['lentil', 200], ['butter bean', 110],
  ['cannellini', 110], ['borlotti', 110], ['black bean', 110], ['kidney bean', 110],
  ['white bean', 110], ['broad bean', 88], ['edamame', 121], ['green bean', 31], ['bean', 80],
  // nuts & seeds
  ['peanut butter', 588], ['almond butter', 614], ['tahini', 595], ['pine nut', 673],
  ['macadamia', 718], ['pecan', 691], ['walnut', 654], ['hazelnut', 628], ['pistachio', 560],
  ['cashew', 553], ['almond', 579], ['peanut', 567], ['pepita', 559], ['pumpkin seed', 559],
  ['sunflower seed', 584], ['sesame seed', 573], ['chia', 486], ['flaxseed', 534], ['dukkah', 480],
  ['coconut, shredded', 660], ['desiccated coconut', 660], ['coconut flake', 660],
  // sugars & sweets
  ['caster sugar', 387], ['brown sugar', 380], ['icing sugar', 389], ['raw sugar', 387],
  ['palm sugar', 375], ['coconut sugar', 375], ['sugar', 387], ['honey', 304],
  ['maple syrup', 260], ['golden syrup', 320], ['glucose', 320], ['molasses', 290],
  ['dark chocolate', 546], ['milk chocolate', 535], ['white chocolate', 539], ['chocolate', 546],
  ['cocoa', 228], ['vanilla', 288], ['dates', 282], ['sultana', 299], ['raisin', 299],
  ['currant', 283], ['dried apricot', 241], ['dried fig', 249], ['barberr', 316], ['jam', 265],
  ['marmalade', 265], ['condensed milk', 321],
  // vegetables
  ['sun-dried tomato', 258], ['sundried tomato', 258], ['tomato paste', 82],
  ['tinned chopped tomato', 32], ['canned cherry tomato', 32], ['crushed tomato', 32],
  ['canned tomato', 32], ['tinned tomato', 32], ['passata', 35], ['cherry tomato', 18],
  ['grape tomato', 18], ['roma tomato', 18], ['heirloom tomato', 18], ['tomato', 18],
  ['sweet potato', 86], ['kipfler', 77], ['chat potato', 77], ['desiree', 77], ['potato', 77],
  ['thick cut fries', 170], ['fries', 170], ['pumpkin', 26], ['butternut', 45], ['squash', 26],
  ['spring onion', 32], ['red onion', 40], ['brown onion', 40], ['white onion', 40],
  ['golden shallot', 72], ['shallot', 72], ['onion', 40], ['leek', 61], ['garlic', 149],
  ['ginger', 80], ['galangal', 71], ['turmeric, fresh', 312], ['lemongrass', 99],
  ['capsicum', 31], ['chilli flake', 320], ['chipotle', 280], ['jalapeño', 29], ['jalapeno', 29],
  ['chilli', 40], ['eggplant', 25], ['zucchini', 17], ['cucumber', 15],
  ['iceberg', 14], ['cos lettuce', 17], ['lettuce', 15], ['radicchio', 23], ['endive', 17],
  ['witlof', 17], ['rocket', 25], ['watercress', 11], ['baby spinach', 23], ['spinach', 23],
  ['silverbeet', 19], ['kale', 49], ['cavolo nero', 49], ['cabbage', 25], ['wombok', 13],
  ['bok choy', 13], ['pak choy', 13], ['brussels sprout', 43], ['brussel sprout', 43],
  ['broccolini', 35], ['broccoli', 34], ['cauliflower', 25], ['celeriac', 42], ['celery', 14],
  ['fennel', 31], ['carrot', 41], ['parsnip', 75], ['beetroot', 43], ['radish', 16],
  ['turnip', 28], ['swede', 38], ['corn', 86], ['peas', 81], ['pea', 81], ['snow pea', 42],
  ['sugar snap', 42], ['asparagus', 20], ['artichoke', 47], ['avocado', 160],
  ['chinese broccoli', 24], ['gai lan', 24], ['choy sum', 20], ['babaganoush', 100],
  ['wood ear mushroom', 25], ['shiitake', 34], ['portobello', 22], ['swiss brown', 22],
  ['oyster mushroom', 33], ['enoki', 37], ['king brown', 35], ['mushroom', 22],
  ['green olive', 145], ['black olive', 115], ['kalamata', 125], ['olive', 125],
  ['caper', 23], ['cornichon', 12], ['gherkin', 12], ['dill pickle', 12], ['pickle', 12],
  ['sauerkraut', 19], ['kimchi', 15], ['seaweed', 45], ['nori', 35],
  // fruit
  ['pomegranate seed', 83], ['pomegranate', 83], ['watermelon', 30], ['rockmelon', 34],
  ['honeydew', 36], ['mango', 60], ['pineapple', 50], ['banana', 89], ['apple', 52],
  ['pear', 57], ['quince', 57], ['peach', 39], ['nectarine', 44], ['plum', 46], ['apricot', 48],
  ['cherry', 63], ['strawberr', 32], ['raspberr', 52], ['blueberr', 57], ['blackberr', 43],
  ['grape', 69], ['fig', 74], ['kiwi', 61], ['passionfruit', 97], ['rhubarb', 21],
  ['mandarin juice', 43], ['mandarin', 53], ['orange juice', 45], ['blood orange', 47],
  ['orange', 47], ['lemon juice', 22], ['preserved lemon', 30], ['lemon', 29],
  ['lime juice', 25], ['lime', 30], ['grapefruit', 42], ['coconut milk', 230],
  ['coconut cream', 330], ['coconut water', 19],
  // condiments, sauces, liquids
  ['white soy', 53], ['dark soy', 60], ['soy sauce', 53], ['tamari', 60], ['fish sauce', 35],
  ['oyster sauce', 51], ['hoisin', 220], ['worcestershire', 78], ['sriracha', 93],
  ['hot sauce', 15], ['gochujang', 180], ['sambal', 100], ['harissa', 70], ['chermoula', 150],
  ['pesto', 400], ['aioli', 680], ['mayonnaise', 680], ['mayo', 680], ['kewpie', 700],
  ['dijon', 66], ['wholegrain mustard', 160], ['mustard', 66], ['horseradish', 48],
  ['wasabi', 109], ['miso', 199], ['tomato sauce', 100], ['ketchup', 100], ['bbq sauce', 165],
  ['ponzu', 60], ['mirin', 227], ['sake', 134], ['shaoxing', 125], ['rice wine', 125],
  ['balsamic', 88], ['red wine vinegar', 19], ['white wine vinegar', 19], ['apple cider vinegar', 21],
  ['rice vinegar', 18], ['sherry vinegar', 25], ['chardonnay vinegar', 25], ['vinegar', 20],
  ['red wine', 85], ['white wine', 82], ['rosé', 83], ['sherry', 120], ['brandy', 231],
  ['rum', 231], ['whisky', 250], ['tequila', 231], ['vermouth', 140], ['beer', 43], ['stout', 45],
  ['vegetable stock', 5], ['beef stock', 8], ['fish stock', 5], ['bone broth', 15],
  ['stock', 5], ['broth', 15], ['dashi', 5], ['verjuice', 60], ['pickled jalapeño juice', 10],
  ['pickle juice', 10], ['pickled jalapeño', 29], ['rosewater', 0], ['orange blossom', 0],
  ['caraway water', 0], ['espresso', 2], ['coffee', 2], ['tea', 1],
  // herbs & spices (mostly negligible amounts)
  ['msg', 0], ['ajinomoto', 0], ['baking powder', 53], ['baking soda', 0], ['bicarb', 0],
  ['yeast', 325], ['gelatine', 335], ['salt', 0], ['pepper', 255], ['sumac', 300],
  ['za\'atar', 300], ['zaatar', 300], ['cumin', 375], ['coriander seed', 298], ['paprika', 282],
  ['turmeric', 312], ['cinnamon', 247], ['nutmeg', 525], ['clove', 274], ['cardamom', 311],
  ['star anise', 337], ['fennel seed', 345], ['caraway', 333], ['mustard seed', 508],
  ['garam masala', 380], ['curry powder', 325], ['curry paste', 130], ['curry leaves', 108],
  ['saffron', 310], ['vanilla bean', 288], ['bay lea', 313], ['oregano', 265], ['thyme', 101],
  ['rosemary', 131], ['sage', 315], ['tarragon', 295], ['marjoram', 271], ['dill', 43],
  ['mint', 44], ['basil', 23], ['parsley', 36], ['coriander', 23], ['cilantro', 23],
  ['chive', 30], ['kaffir lime lea', 80], ['makrut', 80], ['curry lea', 108], ['herb', 40],
  ['onion granule', 341], ['garlic powder', 331], ['onion powder', 341], ['spice', 300],
  ['ice', 0], ['water', 0],
];

// Grams per single item, for count units (whole / small / medium / large / etc).
const ITEM_WEIGHTS = [
  ['egg yolk', 18], ['egg white', 33], ['egg', 50],
  ['chicken breast', 250], ['chicken thigh cutlet', 180], ['chicken thigh', 150],
  ['chicken maryland', 350], ['whole chicken', 1600], ['chicken wing', 90],
  ['duck breast', 300], ['quail', 200],
  ['fish fillet', 180], ['salmon fillet', 180], ['snapper', 800], ['whole fish', 800],
  ['mackerel', 300], ['sardine', 40], ['anchov', 4], ['dover sole', 400], ['prawn', 30],
  ['scallop', 25], ['oyster', 25],
  ['brown onion', 150], ['red onion', 150], ['white onion', 150], ['onion', 150],
  ['golden shallot', 30], ['shallot', 30], ['spring onion', 15], ['leek', 200],
  ['garlic clove', 5], ['garlic bulb', 50], ['garlic head', 50], ['garlic', 5],
  ['lebanese cucumber', 130], ['continental cucumber', 300], ['cucumber', 200],
  ['baby capsicum', 30], ['capsicum', 150], ['long red chilli', 15], ['long green chilli', 15],
  ['bird', 5], ["bird's eye", 5], ['jalapeño', 20], ['jalapeno', 20], ['chilli', 10],
  ['roma tomato', 90], ['cherry tomato', 15], ['heirloom tomato', 180], ['tomato', 120],
  ['zucchini', 200], ['eggplant', 300], ['carrot', 70], ['celery stick', 40], ['celery', 40],
  ['fennel bulb', 250], ['fennel', 250], ['beetroot', 100], ['radish', 15], ['potato', 200],
  ['sweet potato', 250], ['parsnip', 130], ['corn cob', 150], ['corn', 150],
  ['portobello', 85], ['field mushroom', 85], ['swiss brown', 25], ['button mushroom', 20],
  ['mushroom', 30], ['cauliflower', 700], ['broccoli', 300], ['cabbage', 900], ['wombok', 700],
  ['bok choy', 120], ['pak choy', 120], ['baby cos', 150], ['cos lettuce', 300],
  ['iceberg', 500], ['radicchio', 300], ['lettuce', 300], ['witlof', 100], ['endive', 100],
  ['avocado', 150], ['lemon', 50], ['lime', 30], ['orange', 130], ['mandarin', 80],
  ['blood orange', 130], ['grapefruit', 200], ['apple', 150], ['pear', 180], ['quince', 220],
  ['banana', 120], ['mango', 200], ['peach', 150], ['nectarine', 140], ['plum', 65],
  ['apricot', 45], ['fig', 50], ['date', 8], ['passionfruit', 18], ['kiwi', 75],
  ['pomegranate', 200], ['watermelon', 3000],
  ['bay lea', 0.2], ['kaffir lime lea', 0.3], ['makrut', 0.3], ['curry lea', 0.2], ['sage lea', 0.5],
  ['basil lea', 0.5], ['mint lea', 0.2], ['lea', 0.5],
  ['bacon rasher', 34], ['rasher', 34], ['prosciutto slice', 15], ['bread slice', 40],
  ['sourdough slice', 50], ['baguette slice', 25], ['slice', 40],
  ['pita', 60], ['flatbread', 90], ['tortilla', 45], ['naan', 90], ['loaf', 450],
  ['puff pastry sheet', 170], ['filo sheet', 30], ['pastry sheet', 170], ['sheet', 170],
  ['lasagne sheet', 40], ['nori sheet', 3],
  ['star anise', 1], ['cinnamon stick', 4], ['cinnamon quill', 4], ['vanilla bean', 4],
  ['lemongrass stalk', 20], ['lemongrass', 20], ['rosemary sprig', 2], ['thyme sprig', 1],
  ['sprig', 2], ['stalk', 20], ['stick', 20],
  ['dill pickle', 65], ['pickle', 65], ['cornichon', 8], ['gherkin', 30],
  ['chorizo', 125], ['sausage', 80], ['tofu', 300],
];

// g per ml, for volume units (ml / tbsp / tsp / cup); default 1.0
const DENSITY = [
  ['oil', 0.92], ['ghee', 0.91], ['butter', 0.91], ['tahini', 1.05], ['honey', 1.42],
  ['maple', 1.32], ['golden syrup', 1.4], ['flour', 0.53], ['sugar', 0.85], ['cocoa', 0.5],
  ['oats', 0.36], ['breadcrumb', 0.42], ['panko', 0.3], ['rice', 0.8], ['quinoa', 0.74],
  ['couscous', 0.72], ['lentil', 0.77], ['nut', 0.55], ['almond', 0.55], ['walnut', 0.5],
  ['pepita', 0.6], ['seed', 0.6], ['sesame', 0.6], ['parmesan', 0.4], ['cheese', 0.45],
  ['coconut, shredded', 0.35], ['desiccated', 0.35], ['herb', 0.15], ['parsley', 0.15],
  ['mint', 0.15], ['coriander', 0.15], ['dill', 0.15], ['basil', 0.15], ['spinach', 0.2],
  ['rocket', 0.1], ['olive', 0.6], ['caper', 0.6], ['sultana', 0.65], ['raisin', 0.65],
  ['chocolate', 0.65], ['miso', 1.05], ['yoghurt', 1.03], ['yogurt', 1.03], ['cream', 1.0],
  ['edamame', 0.55], ['peas', 0.6], ['corn', 0.65], ['chickpea', 0.65], ['bean', 0.65],
  ['pomegranate', 0.6],
];

// grams for a "bunch" of X
const BUNCH_WEIGHTS = [
  ['broccolini', 175], ['asparagus', 175], ['kale', 150], ['cavolo nero', 150],
  ['silverbeet', 300], ['spinach', 150], ['english spinach', 150], ['bok choy', 250],
  ['pak choy', 250], ['choy sum', 250], ['gai lan', 250], ['radish', 250], ['beetroot', 350],
  ['baby carrot', 250], ['carrot', 400], ['spring onion', 100], ['coriander', 40],
  ['parsley', 40], ['basil', 40], ['mint', 30], ['dill', 25], ['thyme', 20], ['oregano', 20],
  ['sage', 20], ['tarragon', 20], ['chive', 25], ['watercress', 100], ['rocket', 100],
  ['sorrel', 60], ['grape', 500], ['chinese broccoli', 250], ['choy sum', 250],
];

// typical drained tin weights differ a lot by content
const TIN_WEIGHTS = [
  ['sardine', 120], ['anchov', 80], ['tuna', 185], ['salmon', 210],
];

function lookup(table, name) {
  const n = name.toLowerCase();
  let best = null, bestLen = -1;
  for (const [kw, val] of table) {
    if (n.includes(kw) && kw.length > bestLen) { best = val; bestLen = kw.length; }
  }
  return best;
}

// Convert one ingredient line to grams. Returns {grams, matched:boolean}
function toGrams(ing) {
  const name = (ing.name || '').toLowerCase();
  const unit = (ing.unit || '').toLowerCase().trim();
  const amt = ing.amount || 0;

  const NEGLIGIBLE = ['to taste', 'to serve', 'pinch', 'sprig', 'sprigs'];
  if (NEGLIGIBLE.includes(unit)) return { grams: lookup(ITEM_WEIGHTS, name) === null ? 0 : 0, matched: true };
  if (unit === 'handful') return { grams: amt * 15, matched: true };
  if (unit === 'splash') return { grams: amt * 10, matched: true };
  if (unit === 'scoop') return { grams: amt * 60, matched: true };
  if (unit === 'thumb') return { grams: amt * 15, matched: true };
  if (unit === 'tin' || unit === 'tins') {
    const w = lookup(TIN_WEIGHTS, name);
    return { grams: amt * (w != null ? w : 400), matched: true };
  }
  if (unit === 'packet') return { grams: amt * 500, matched: true };
  if (unit === 'punnet') return { grams: amt * 250, matched: true };
  if (unit === 'bunch' || unit === 'bunches') {
    const w = lookup(BUNCH_WEIGHTS, name);
    return { grams: amt * (w != null ? w : 50), matched: w != null };
  }
  if (unit === 'g') return { grams: amt, matched: true };
  if (unit === 'kg') return { grams: amt * 1000, matched: true };
  const VOLUME_ML = { ml: 1, l: 1000, litre: 1000, litres: 1000, tbsp: 20, tsp: 5, cup: 250, cups: 250 };
  if (unit in VOLUME_ML) {
    const ml = amt * VOLUME_ML[unit];
    const d = lookup(DENSITY, name);
    return { grams: ml * (d != null ? d : 1.0), matched: true };
  }
  // Count units: whole, small, medium, large, clove(s), slice(s), lemon, head, etc.
  // If the unit itself names the item (e.g. unit 'lemon'), look that up too.
  const w = lookup(ITEM_WEIGHTS, name + ' ' + unit);
  if (w != null) return { grams: amt * w, matched: true };
  return { grams: amt * 80, matched: false }; // unknown count item: assume 80 g each
}

// Estimate kcal per serve. Returns {perServe, total, coverage} where coverage
// is the fraction of ingredient mass whose kcal value was confidently matched.
function estimateCaloriesPerServe(recipe) {
  let total = 0, matchedMass = 0, totalMass = 0;
  for (const ing of recipe.ingredients || []) {
    if (ing.section) continue;
    let { grams, matched } = toGrams(ing);
    // oil "for frying" is mostly discarded; count roughly what gets absorbed
    if (/for (deep.?-?\s*)?fry/i.test(ing.name || '')) grams *= 0.12;
    const kcal100 = lookup(KCAL_PER_100G, ing.name || '');
    const kcal = grams * (kcal100 != null ? kcal100 : 50) / 100;
    total += kcal;
    totalMass += grams;
    if (matched && kcal100 != null) matchedMass += grams;
  }
  const serves = recipe.serves || 1;
  return {
    perServe: Math.round(total / serves),
    total: Math.round(total),
    coverage: totalMass ? matchedMass / totalMass : 0,
  };
}

module.exports = { estimateCaloriesPerServe, toGrams, lookup, KCAL_PER_100G, ITEM_WEIGHTS };

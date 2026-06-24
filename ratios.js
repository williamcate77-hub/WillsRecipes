const RATIOS=[

// ── PHASE 1 — SAUCES & DRESSINGS ──────────────────────────────────────────
{
  id:'quick-pickle',name:'Quick Pickle Brine',category:'Sauces & Dressings',phase:1,type:'BRINE',
  formula:[
    {parts:2,label:'WATER',metricVal:250,metricUnit:'ml'},
    {parts:1,label:'VINEGAR',metricVal:125,metricUnit:'ml'},
    {parts:1,label:'SUGAR',metricVal:30,metricUnit:'g'},
    {parts:1,label:'SALT',metricVal:20,metricUnit:'g'},
  ],
  technique:'Pour over sliced vegetables. Rest 30 minutes minimum; overnight gives a cleaner, deeper flavour. Works on anything — cucumber, red onion, carrot, radish, jalapeño.',
  swaps:'Apple cider or white wine vinegar for rice vinegar.',
  recipeIds:[],
},
{
  id:'salad-dressing',name:'Salad Dressing',category:'Sauces & Dressings',phase:1,type:'DRESSING',
  formula:[
    {parts:3,label:'OLIVE OIL',metricVal:90,metricUnit:'ml'},
    {parts:1,label:'VINEGAR',metricVal:30,metricUnit:'ml'},
    {parts:1,label:'HONEY',metricVal:15,metricUnit:'g'},
    {parts:1,label:'MUSTARD',metricVal:10,metricUnit:'g'},
  ],
  technique:'Shake or whisk until emulsified. Add a crushed garlic clove or fresh herbs to vary. Prefer a sharper dressing? Drop to 2 parts oil.',
  swaps:'Lemon juice for vinegar in summer. Tahini for mustard for a nuttier version.',
  recipeIds:[],
},
{
  id:'teriyaki',name:'Teriyaki Sauce',category:'Sauces & Dressings',phase:1,type:'SAUCE',
  formula:[
    {parts:2,label:'SOY',metricVal:60,metricUnit:'ml'},
    {parts:2,label:'SAKE',metricVal:60,metricUnit:'ml'},
    {parts:2,label:'MIRIN',metricVal:60,metricUnit:'ml'},
    {parts:1,label:'SUGAR',metricVal:30,metricUnit:'g'},
  ],
  technique:'Simmer and reduce 8–10 minutes until glossy and coating the back of a spoon. Works on salmon, chicken thighs, eggplant, tofu.',
  swaps:'Dry sherry for sake if unavailable. Tamari for a gluten-free version.',
  recipeIds:[],
},
{
  id:'chimichurri',name:'Chimichurri',category:'Sauces & Dressings',phase:1,type:'SAUCE',
  formula:[
    {parts:6,label:'OIL',metricVal:120,metricUnit:'ml'},
    {parts:3,label:'VINEGAR',metricVal:60,metricUnit:'ml'},
    {parts:2,label:'HERBS',metricVal:40,metricUnit:'g'},
    {parts:1,label:'AROMATIC',metricVal:20,metricUnit:'g'},
  ],
  technique:'Use parsley, coriander, or both for herbs. Garlic or shallot for the aromatic. Rest 10–15 minutes before serving so the flavours settle. Pairs with steak, chicken, grilled broccolini, or roasted cauliflower.',
  swaps:'',
  recipeIds:[],
},
{
  id:'miso-dressing',name:'Miso Dressing',category:'Sauces & Dressings',phase:1,type:'DRESSING',
  formula:[
    {parts:4,label:'MISO',metricVal:60,metricUnit:'g'},
    {parts:3,label:'SESAME OIL',metricVal:45,metricUnit:'ml'},
    {parts:2,label:'VINEGAR',metricVal:30,metricUnit:'ml'},
    {parts:1,label:'SOY',metricVal:15,metricUnit:'ml'},
    {parts:1,label:'OJ',metricVal:15,metricUnit:'ml'},
    {parts:1,label:'HONEY',metricVal:15,metricUnit:'g'},
  ],
  technique:'Whisk until smooth. Add a splash of water to loosen if needed. Excellent on grain bowls, roasted vegetables, or as a salmon glaze.',
  swaps:'Rice vinegar for white wine vinegar. White miso for a milder, sweeter result.',
  recipeIds:[],
},

// ── PHASE 2 — STOCKS & BASES ──────────────────────────────────────────────
{
  id:'salt-conversion',name:'Salt Conversion',category:'Stocks & Bases',phase:1,type:'CONVERSION',
  formula:[
    {parts:1,label:'TABLE',metricVal:6,metricUnit:'g'},
    {parts:1,label:'SEA FINE',metricVal:6,metricUnit:'g'},
    {parts:1,partsLabel:'~1',label:'MORTON',metricVal:5,metricUnit:'g'},
    {parts:1.5,partsLabel:'1–2',label:'SEA COARSE',metricVal:4.5,metricUnit:'g'},
    {parts:2,label:'D. CRYSTAL',metricVal:3,metricUnit:'g'},
    {parts:3,label:'SEA FLAKEY',metricVal:2,metricUnit:'g'},
  ],
  technique:'Parts show tablespoons needed to replace 1 tbsp of table salt. All salts deliver equal saltiness — the difference is density. Diamond Crystal and flakey salts are much lighter, so you need more by volume. Use grams when precision matters.',
  swaps:'Always season by taste, not volume. You can\'t unsalt a dish — start with less and adjust.',
  recipeIds:[],
},
{
  id:'white-stock',name:'White Stock',category:'Stocks & Bases',phase:2,type:'STOCK',
  formula:[
    {parts:3,label:'WATER',metricVal:1500,metricUnit:'ml'},
    {parts:2,label:'BONES',metricVal:1000,metricUnit:'g'},
  ],
  technique:'By weight. Add mirepoix at roughly 10% of total volume. Simmer gently — never boil or the stock clouds. Chicken, veal, or fish bones all work.',
  swaps:'Add a bay leaf, peppercorns, and thyme for a classic bouquet garni.',
  recipeIds:[],
},
{
  id:'wet-brine',name:'Wet Brine',category:'Stocks & Bases',phase:2,type:'BRINE',
  formula:[
    {parts:20,label:'WATER',metricVal:1000,metricUnit:'ml'},
    {parts:1,label:'SALT',metricVal:50,metricUnit:'g'},
  ],
  technique:'By weight. 30–60 minutes for fillets; 4–12 hours for whole birds. Add 1 part sugar and aromatics freely. Results in noticeably juicier meat.',
  swaps:'Add citrus peel, garlic, or fresh herbs to the brine for extra flavour.',
  recipeIds:[],
},
{
  id:'simple-syrup',name:'Simple Syrup',category:'Stocks & Bases',phase:2,type:'SWEET',
  formula:[
    {parts:1,label:'SUGAR',metricVal:200,metricUnit:'g'},
    {parts:1,label:'WATER',metricVal:200,metricUnit:'ml'},
  ],
  technique:'By volume. Stir over low heat until sugar dissolves — do not boil. Base for cocktails, glazes, and poaching liquids. Rich syrup is 2:1 sugar to water.',
  swaps:'Infuse with vanilla, rosemary, or citrus zest while warm.',
  recipeIds:[],
},

// ── PHASE 2 — SAUCES & EMULSIONS ─────────────────────────────────────────
{
  id:'roux',name:'Roux',category:'Sauces & Emulsions',phase:2,type:'SAUCE BASE',
  formula:[
    {parts:1,label:'FAT',metricVal:50,metricUnit:'g'},
    {parts:1,label:'FLOUR',metricVal:50,metricUnit:'g'},
  ],
  technique:'By weight. Cook time and colour determines flavour — white roux for cream sauces, blonde for velouté, dark for gumbo. Foundation for béchamel, gravy, and chowders.',
  swaps:'Butter is classic. Duck fat or olive oil work for flavour variations.',
  recipeIds:[],
},
{
  id:'bechamel',name:'Béchamel',category:'Sauces & Emulsions',phase:2,type:'SAUCE',
  formula:[
    {parts:10,label:'MILK',metricVal:500,metricUnit:'ml'},
    {parts:1,label:'ROUX',metricVal:50,metricUnit:'g'},
  ],
  technique:'Add warm milk gradually to the roux, whisking constantly. Season with nutmeg and white pepper. Add more milk to thin; reduce to thicken. Add cheese for mornay.',
  swaps:'Use oat milk for a dairy-free version — result is slightly less rich but functional.',
  recipeIds:[],
},
{
  id:'hollandaise',name:'Hollandaise',category:'Sauces & Emulsions',phase:2,type:'SAUCE',
  formula:[
    {parts:5,label:'BUTTER',metricVal:150,metricUnit:'g'},
    {parts:1,label:'YOLK',metricVal:2,metricUnit:'whole'},
    {parts:1,label:'ACID',metricVal:30,metricUnit:'ml'},
  ],
  technique:'Warm emulsion — keep below 65°C or the yolks scramble. Whisk constantly over a bain marie. Use lemon juice or a white wine reduction as the acid. Serve immediately.',
  swaps:'Add tarragon and shallot reduction to the acid to make béarnaise.',
  recipeIds:[],
},
{
  id:'mayonnaise',name:'Mayonnaise',category:'Sauces & Emulsions',phase:2,type:'EMULSION',
  formula:[
    {parts:20,label:'OIL',metricVal:240,metricUnit:'ml'},
    {parts:1,label:'LIQUID',metricVal:15,metricUnit:'ml'},
    {parts:1,label:'YOLK',metricVal:1,metricUnit:'whole'},
  ],
  technique:'Add oil drop by drop at the start to build the emulsion, then stream in. Lemon juice or white wine vinegar as the liquid. Add garlic for aioli.',
  swaps:'Neutral oil (sunflower, grapeseed) for classic flavour. Light olive oil adds a mild bitterness.',
  recipeIds:[],
},
{
  id:'pan-sauce',name:'Pan Sauce',category:'Sauces & Emulsions',phase:2,type:'SAUCE',
  formula:[
    {parts:1,label:'FAT',metricVal:30,metricUnit:'ml'},
    {parts:1,label:'AROMATICS',metricVal:30,metricUnit:'g'},
    {parts:0.5,partsLabel:'½',label:'LIQUID',metricVal:120,metricUnit:'ml'},
    {parts:0.5,partsLabel:'½',label:'ENRICHMENT',metricVal:30,metricUnit:'g'},
  ],
  technique:'Sauté aromatics in the fat left from searing. Deglaze with wine or stock and reduce. Finish with cold butter or cream off the heat. Takes 5 minutes.',
  swaps:'Enrichment: butter for silkiness, cream for body, mustard for sharpness.',
  recipeIds:[],
},
{
  id:'caramel-sauce',name:'Caramel Sauce',category:'Sauces & Emulsions',phase:2,type:'SWEET',
  formula:[
    {parts:1,label:'SUGAR',metricVal:200,metricUnit:'g'},
    {parts:1,label:'CREAM',metricVal:200,metricUnit:'ml'},
  ],
  technique:'Dry-caramelise the sugar first until deep amber, then carefully add warm cream — it will spit. Stir in cold butter and a good pinch of salt at the end.',
  swaps:'Add a splash of whisky or bourbon when adding the cream for a grown-up version.',
  recipeIds:[],
},
{
  id:'ganache',name:'Chocolate Ganache',category:'Sauces & Emulsions',phase:2,type:'SWEET',
  formula:[
    {parts:1,label:'CHOCOLATE',metricVal:200,metricUnit:'g'},
    {parts:1,label:'CREAM',metricVal:200,metricUnit:'ml'},
  ],
  technique:'Pour hot cream over chopped chocolate and rest 2 minutes before stirring from the centre out. 1:1 for a pourable glaze; 2:1 chocolate to cream for truffles; 1:2 for a thin sauce.',
  swaps:'Add a pinch of sea salt, espresso, or orange zest to the cream before heating.',
  recipeIds:[],
},

// ── PHASE 2 — GRAINS & DOUGHS ────────────────────────────────────────────
{
  id:'rice-pilaf',name:'Rice Pilaf',category:'Grains & Doughs',phase:2,type:'GRAIN',
  formula:[
    {parts:2,label:'LIQUID',metricVal:400,metricUnit:'ml'},
    {parts:1,label:'RICE',metricVal:200,metricUnit:'g'},
  ],
  technique:'By volume. Toast the rice in butter first for better flavour and separation. Bring to a simmer, cover, and leave undisturbed for 15–18 minutes. Works with any variety.',
  swaps:'Use stock instead of water for a richer result.',
  recipeIds:[],
},
{
  id:'risotto',name:'Risotto',category:'Grains & Doughs',phase:2,type:'GRAIN',
  formula:[
    {parts:3,label:'STOCK',metricVal:900,metricUnit:'ml'},
    {parts:1,label:'ARBORIO',metricVal:300,metricUnit:'g'},
  ],
  technique:'Add stock gradually, not all at once. Stir frequently for 16–18 minutes. Finish with cold butter and parmesan off the heat. The mantecatura (stirring in the butter) is what makes it creamy.',
  swaps:'Any warm stock works — chicken, vegetable, or fish depending on the dish.',
  recipeIds:[],
},
{
  id:'fresh-pasta',name:'Fresh Pasta Dough',category:'Grains & Doughs',phase:2,type:'DOUGH',
  formula:[
    {parts:2,label:'FLOUR',metricVal:200,metricUnit:'g'},
    {parts:1,label:'EGG',metricVal:2,metricUnit:'whole'},
  ],
  technique:'By weight — 100g flour to 1 large egg (approx 50g). Knead 8–10 minutes. Rest 20 minutes before rolling. The rest is not optional — it relaxes the gluten.',
  swaps:'00 flour for silkier pasta; all-purpose works well at home. Add a yolk or two for a richer, yellower dough.',
  recipeIds:[],
},
{
  id:'bread-dough',name:'Bread Dough',category:'Grains & Doughs',phase:2,type:'DOUGH',
  formula:[
    {parts:5,label:'FLOUR',metricVal:500,metricUnit:'g'},
    {parts:3,label:'WATER',metricVal:300,metricUnit:'ml'},
  ],
  technique:'By weight, plus yeast and salt (salt at roughly 2% of flour weight). Lower hydration (60%) for sandwich loaves; push to 75–80% for open-crumb artisan bread.',
  swaps:'Add a splash more water for wholemeal or rye — they absorb more.',
  recipeIds:[],
},
{
  id:'shortcrust',name:'Shortcrust Pastry',category:'Grains & Doughs',phase:2,type:'DOUGH',
  formula:[
    {parts:3,label:'FLOUR',metricVal:300,metricUnit:'g'},
    {parts:2,label:'BUTTER',metricVal:200,metricUnit:'g'},
    {parts:1,label:'WATER',metricVal:60,metricUnit:'ml'},
  ],
  technique:'Keep everything cold. Work the butter in until it resembles breadcrumbs, then add iced water just until it comes together. Do not overwork. Rest 30 minutes in the fridge before rolling.',
  swaps:'Add a pinch of sugar for sweet pastry. Replace half the butter with lard for extra crumble.',
  recipeIds:[],
},
{
  id:'pancake-batter',name:'Pancakes & Quick Breads',category:'Grains & Doughs',phase:2,type:'BATTER',
  formula:[
    {parts:2,label:'FLOUR',metricVal:200,metricUnit:'g'},
    {parts:2,label:'LIQUID',metricVal:240,metricUnit:'ml'},
    {parts:1,label:'EGG',metricVal:2,metricUnit:'whole'},
  ],
  technique:'The structural ratio for pancakes, muffins, and quick bread loaves. Add fat and sugar to taste — they do not change the base structure. Rest the batter 5 minutes before cooking.',
  swaps:'Buttermilk for more flavour and lift. Almond milk works 1:1 for dairy-free.',
  recipeIds:[],
},
{
  id:'meringue',name:'Meringue',category:'Grains & Doughs',phase:2,type:'SWEET',
  formula:[
    {parts:1,label:'EGG WHITE',metricVal:100,metricUnit:'g'},
    {parts:2,label:'SUGAR',metricVal:200,metricUnit:'g'},
  ],
  technique:'By weight. Whisk whites to soft peaks first, then add sugar gradually. For pavlova, add a teaspoon of white vinegar and cornflour to stabilise the centre and keep it marshmallow-soft.',
  swaps:'Caster sugar for a smoother result. Icing sugar for a denser, finer meringue.',
  recipeIds:[],
},

// ── PHASE 2 — SLOW COOK ───────────────────────────────────────────────────
{
  id:'braise',name:'Braise',category:'Slow Cook',phase:2,type:'METHOD',
  formula:[
    {parts:10,label:'PROTEIN',metricVal:1000,metricUnit:'g'},
    {parts:1,label:'MIREPOIX',metricVal:100,metricUnit:'g'},
    {parts:1.5,partsLabel:'1–2',label:'LIQUID',metricVal:300,metricUnit:'ml'},
  ],
  technique:'Sear the protein first, build the mirepoix in the same pan, then add liquid. Low oven at 150–160°C for 2–4 hours depending on the cut. The liquid can be stock, wine, beer, or a combination.',
  swaps:'Mirepoix can become Italian soffritto, or add mushrooms and shallots for a richer base. Works for beef short ribs, lamb shoulder, pork belly, chicken thighs.',
  recipeIds:[],
},

];

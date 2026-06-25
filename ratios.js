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

// ── SAUCES & DRESSINGS (new) ──────────────────────────────────────────────
{
  id:'ponzu',name:'Ponzu',category:'Sauces & Dressings',phase:1,type:'SAUCE',
  formula:[
    {parts:1,label:'SOY SAUCE',metricVal:60,metricUnit:'ml'},
    {parts:1,label:'CITRUS',metricVal:60,metricUnit:'ml'},
    {parts:1,label:'MIRIN',metricVal:60,metricUnit:'ml'},
  ],
  technique:'Rest at least 30 minutes before serving — the flavours need time to marry. Use yuzu, lemon, or lime as the citrus. Used for: dipping sauce for gyoza, shabu shabu, cold tofu, grilled fish, and chicken karaage — also works as a light dressing for sashimi, beef tataki, or Vietnamese-style summer rolls.',
  swaps:'Add rice vinegar in equal parts to the citrus for a sharper, more acidic version.',
  recipeIds:[],
},

// ── STOCKS & BASES (new) ─────────────────────────────────────────────────
{
  id:'mirepoix',name:'Mirepoix',category:'Stocks & Bases',phase:1,type:'BASE',
  formula:[
    {parts:2,label:'ONION',metricVal:200,metricUnit:'g'},
    {parts:1,label:'CARROT',metricVal:100,metricUnit:'g'},
    {parts:1,label:'CELERY',metricVal:100,metricUnit:'g'},
  ],
  technique:'By weight. The aromatic base for stocks, soups, braises, and sauces. Cook low and slow in butter or oil until softened — do not brown unless the dish calls for colour. Used for: chicken stock, beef braise, French onion soup, bolognese, cassoulet, risotto base — it dissolves into the background and builds the flavour platform everything else sits on.',
  swaps:'Leek for onion for a milder base. Replace celery with fennel in fish dishes.',
  recipeIds:[],
},
{
  id:'cold-brew',name:'Cold Brew Coffee',category:'Stocks & Bases',phase:1,type:'BREW',
  formula:[
    {parts:1,label:'COFFEE',metricVal:100,metricUnit:'g'},
    {parts:6,partsLabel:'4–8',label:'COLD WATER',metricVal:600,metricUnit:'ml'},
  ],
  technique:'Steep 12–24 hours in the fridge. Past 24 hours it turns bitter. Strain through a fine mesh or paper filter. 1:4 for concentrate; 1:8 for ready-to-drink. Used for: iced coffee, cold brew lattes, coffee cocktails, tiramisu — also works as a coffee flavouring in desserts and baked goods.',
  swaps:'Add a cinnamon stick or vanilla bean to the steep for a flavoured cold brew.',
  recipeIds:[],
},

// ── SAUCES & EMULSIONS (new) ─────────────────────────────────────────────
{
  id:'creme-brulee',name:'Crème Brûlée',category:'Sauces & Emulsions',phase:1,type:'CUSTARD',
  formula:[
    {parts:4,label:'CREAM',metricVal:400,metricUnit:'ml'},
    {parts:1,label:'EGG YOLK',metricVal:4,metricUnit:'whole'},
  ],
  technique:'By volume. Bake at 150°C in a bain-marie until just set with a slight wobble in the centre. Torch the sugar topping immediately before serving, not in advance. Used for: individual baked custard desserts — also applies to any baked set custard flavoured with espresso, lavender, matcha, or citrus zest.',
  swaps:'Replace half the cream with whole milk for a lighter, less rich custard.',
  recipeIds:[],
},
{
  id:'creme-anglaise',name:'Crème Anglaise',category:'Sauces & Emulsions',phase:1,type:'CUSTARD',
  formula:[
    {parts:4,label:'MILK',metricVal:400,metricUnit:'ml'},
    {parts:1,label:'EGG YOLK',metricVal:4,metricUnit:'whole'},
    {parts:1,label:'SUGAR',metricVal:80,metricUnit:'g'},
  ],
  technique:'Stir constantly over low heat until it coats the back of a spoon. Never boil. Strain immediately into a cold bowl. Used for: poured over warm puddings, tarts, and fruit crumbles; churned as the base for ice cream; folded with gelatine as a base for bavarois and charlotte royale.',
  swaps:'Infuse the warm milk with vanilla bean, cardamom, or Earl Grey before adding yolks for a cleaner flavour transfer.',
  recipeIds:[],
},
{
  id:'pastry-cream',name:'Pastry Cream',category:'Sauces & Emulsions',phase:1,type:'CUSTARD',
  formula:[
    {parts:4,label:'MILK',metricVal:500,metricUnit:'ml'},
    {parts:1,label:'EGG YOLK',metricVal:4,metricUnit:'whole'},
    {parts:1,label:'SUGAR',metricVal:100,metricUnit:'g'},
    {parts:1,label:'STARCH',metricVal:40,metricUnit:'g'},
  ],
  technique:'Thicker than crème anglaise because of the starch — sets firm enough to pipe. Whisk constantly once the milk hits the yolks or it will seize. Used for: filling tarts, éclairs, mille-feuille, doughnuts, Boston cream pie, fruit flans — any pastry that needs a stable, pipeable custard.',
  swaps:'Fold in equal-weight whipped cream after cooling to make a lighter diplomat cream.',
  recipeIds:[],
},

// ── GRAINS & DOUGHS (new) ────────────────────────────────────────────────
{
  id:'rough-puff',name:'Rough Puff Pastry',category:'Grains & Doughs',phase:1,type:'DOUGH',
  formula:[
    {parts:2,label:'FLOUR',metricVal:200,metricUnit:'g'},
    {parts:2,label:'BUTTER',metricVal:200,metricUnit:'g'},
    {parts:1,label:'ICE WATER',metricVal:100,metricUnit:'ml'},
  ],
  technique:'By weight. Chop butter into walnut-sized chunks — those visible lumps create the layers. Roll, fold in thirds, turn 90°, repeat six times total. Rest in the fridge between folds if the butter starts to soften. Close to full puff pastry with a fraction of the effort. Used for: sausage rolls, pie tops, tarts, turnovers, palmiers, cheese straws, beef wellington.',
  swaps:'Replace half the butter with lard for a richer, more savoury crust — particularly good on meat pies.',
  recipeIds:[],
},
{
  id:'egg-pasta-00',name:'Classic Egg Pasta — 00',category:'Grains & Doughs',phase:1,type:'DOUGH',
  formula:[
    {parts:2,label:'00 FLOUR',metricVal:200,metricUnit:'g'},
    {parts:1,label:'EGG',metricVal:2,metricUnit:'whole'},
  ],
  technique:'By weight — 100g flour to 1 large egg. Use 00 flour for maximum silkiness. The finest grind hydrates instantly and produces a tender, supple dough that rolls paper-thin. Used for: tagliatelle, pappardelle, fettuccine, lasagne sheets, ravioli, tortellini, farfalle, garganelli.',
  swaps:'All-purpose flour works well at home. Add an extra yolk for a richer, more golden dough.',
  recipeIds:[],
},
{
  id:'semolina-00-pasta',name:'Semolina & 00 Pasta',category:'Grains & Doughs',phase:1,type:'DOUGH',
  formula:[
    {parts:7,label:'00 FLOUR',metricVal:140,metricUnit:'g'},
    {parts:3,label:'SEMOLINA',metricVal:60,metricUnit:'g'},
  ],
  technique:'Blend 7:3 (00 to semolina), then combine at 100g total flour to 1 large egg. The 00 gives silk and elasticity; the semolina adds structural bite and a rough surface that holds sauce. The best all-purpose home pasta dough. Used for: all rolled shapes, stuffed pasta, fettuccine, pappardelle, lasagne.',
  swaps:'Use fine semolina (semola rimacinata) rather than coarse for a smoother result.',
  recipeIds:[],
},
{
  id:'semolina-water-pasta',name:'Pure Semolina Pasta',category:'Grains & Doughs',phase:1,type:'DOUGH',
  formula:[
    {parts:3,label:'SEMOLINA',metricVal:300,metricUnit:'g'},
    {parts:1,label:'WATER',metricVal:100,metricUnit:'ml'},
  ],
  technique:'By weight. No egg. Higher protein from durum wheat gives serious chew and holds up to heavy, chunky sauces. Used for: orecchiette, cavatelli, trofie, lorighittas, busiate — hand-shaped southern Italian pasta best paired with broccoli rabe, sausage, or tomato-based ragù.',
  swaps:'Add a small amount of fine semolina to the coarse for a smoother, easier-to-shape dough.',
  recipeIds:[],
},
{
  id:'egg-yolk-pasta',name:'Rich Egg Yolk Pasta',category:'Grains & Doughs',phase:1,type:'DOUGH',
  formula:[
    {parts:2,label:'00 FLOUR',metricVal:200,metricUnit:'g'},
    {parts:1,label:'EGG YOLK',metricVal:6,metricUnit:'whole'},
  ],
  technique:'Roughly 3 yolks per 100g flour — no whites. Deeply golden, intensely rich, more flavourful than standard egg pasta. Roll very thin. Used for: tajarin, fine tagliolini, and any pasta where the noodle is the centrepiece — served simply with brown butter, truffle, or a light cream sauce.',
  swaps:'One whole egg plus one extra yolk per 100g is a practical middle ground between standard and yolk-only.',
  recipeIds:[],
},
{
  id:'pici',name:'Pici',category:'Grains & Doughs',phase:1,type:'DOUGH',
  formula:[
    {parts:2,label:'00 FLOUR',metricVal:200,metricUnit:'g'},
    {parts:1,label:'WATER',metricVal:100,metricUnit:'ml'},
  ],
  technique:'By weight, plus a drizzle of olive oil. Rolled into thick ropes by hand — no machine needed. The rough hand-rolled surface catches sauce exceptionally well. Used for: pici cacio e pepe, pici all\'aglione (garlic tomato sauce), pici with wild boar ragù — a Tuscan staple suited to bold, rustic sauces.',
  swaps:'All-purpose flour works identically here — gluten development is the goal, not tenderness.',
  recipeIds:[],
},
{
  id:'gnocchi',name:'Gnocchi',category:'Grains & Doughs',phase:1,type:'DOUGH',
  formula:[
    {parts:3,label:'POTATO',metricVal:300,metricUnit:'g'},
    {parts:1,label:'00 FLOUR',metricVal:100,metricUnit:'g'},
    {parts:0.5,partsLabel:'½',label:'EGG',metricVal:1,metricUnit:'whole'},
  ],
  technique:'By weight. Bake rather than boil the potato — boiling waterloggs it and forces more flour, making gnocchi dense. Work the dough as little as possible once the flour goes in. Test one dumpling in boiling water before rolling the whole batch. Used for: gnocchi al pomodoro, gorgonzola, burro e salvia — also pan-fried until crispy.',
  swaps:'Replace up to half the potato with roasted pumpkin for a sweeter seasonal version. Ricotta instead of potato gives a lighter, pillow-soft result.',
  recipeIds:[],
},
{
  id:'buckwheat-pasta',name:'Buckwheat Pasta (Pizzoccheri)',category:'Grains & Doughs',phase:1,type:'DOUGH',
  formula:[
    {parts:3,label:'BUCKWHEAT',metricVal:150,metricUnit:'g'},
    {parts:1,label:'00 FLOUR',metricVal:50,metricUnit:'g'},
    {parts:2,label:'WATER',metricVal:100,metricUnit:'ml'},
  ],
  technique:'Buckwheat alone lacks gluten — the 00 flour provides elasticity. Water is roughly half the total flour weight. Earthy, slightly bitter flavour that pairs with fat and funk. Used for: pizzoccheri Valtellinese (brown butter, Fontina, potato, cavolo nero) — also as ribbons with mushroom or aged cheese sauces.',
  swaps:'Substitute a small amount of the 00 with whole wheat for a nuttier, coarser result.',
  recipeIds:[],
},
{
  id:'tempura',name:'Tempura Batter',category:'Grains & Doughs',phase:1,type:'BATTER',
  formula:[
    {parts:1,label:'FLOUR',metricVal:100,metricUnit:'g'},
    {parts:1,label:'ICE WATER',metricVal:100,metricUnit:'ml'},
  ],
  technique:'By volume. Mix with chopsticks for 15 seconds only — lumps are correct. Everything must be cold. Mix it and walk it straight to the oil. Used for: prawns, sweet potato, eggplant, zucchini, mushroom, green beans, fish fillets, soft shell crab — any ingredient that benefits from a light, lacey coating.',
  swaps:'Replace one third of the flour with cornstarch for a crisper result on high-moisture vegetables like mushroom or tofu.',
  recipeIds:[],
},
{
  id:'beer-batter',name:'Beer Batter',category:'Grains & Doughs',phase:1,type:'BATTER',
  formula:[
    {parts:2,label:'FLOUR',metricVal:200,metricUnit:'g'},
    {parts:1,label:'COLD BEER',metricVal:100,metricUnit:'ml'},
  ],
  technique:'By volume, plus a pinch of salt. The carbonation creates air pockets that keep the crust light. Use immediately and keep the batter cold. Used for: battered fish, onion rings, halloumi, calamari, potato scallops — any deep-fried pub classic where a thick, crispy crust is the point.',
  swaps:'Sparkling water works in place of beer for an alcohol-free version with the same effect.',
  recipeIds:[],
},
{
  id:'crepe-batter',name:'Crêpe Batter',category:'Grains & Doughs',phase:1,type:'BATTER',
  formula:[
    {parts:1,label:'FLOUR',metricVal:125,metricUnit:'g'},
    {parts:1,label:'LIQUID',metricVal:125,metricUnit:'ml'},
    {parts:0.5,partsLabel:'½',label:'EGG',metricVal:1,metricUnit:'whole'},
  ],
  technique:'By weight. Rest the batter overnight in the fridge — this relaxes the gluten and produces a thin, pliable crêpe. Used for: sweet crêpes with lemon and sugar, Nutella, or fruit compote; savoury galettes with ham, cheese, and egg; crêpes Suzette; crêpe cake layered with pastry cream.',
  swaps:'Half milk, half water for a lighter result. Brown butter stirred in adds significant flavour.',
  recipeIds:[],
},
{
  id:'choux',name:'Choux Pastry',category:'Grains & Doughs',phase:1,type:'PASTRY',
  formula:[
    {parts:2,label:'WATER',metricVal:200,metricUnit:'ml'},
    {parts:1,label:'BUTTER',metricVal:100,metricUnit:'g'},
    {parts:1,label:'FLOUR',metricVal:100,metricUnit:'g'},
    {parts:2,label:'EGG',metricVal:4,metricUnit:'whole'},
  ],
  technique:'Cook water and butter together first, beat in the flour off the heat until the dough pulls away from the pan, then add eggs one at a time. Used for: profiteroles, éclairs, Paris-Brest, gougères (with cheese), churros, croquembouche, cream puffs — any pastry that relies on steam to puff hollow.',
  swaps:'Replace half the water with milk for a richer, glossier result.',
  recipeIds:[],
},
{
  id:'pound-cake',name:'Pound Cake',category:'Grains & Doughs',phase:1,type:'CAKE',
  formula:[
    {parts:1,label:'BUTTER',metricVal:200,metricUnit:'g'},
    {parts:1,label:'SUGAR',metricVal:200,metricUnit:'g'},
    {parts:1,label:'EGG',metricVal:4,metricUnit:'whole'},
    {parts:1,label:'FLOUR',metricVal:200,metricUnit:'g'},
  ],
  technique:'By weight. Cream butter and sugar until pale before adding eggs gradually. The most forgiving ratio in baking — all four elements equal. Used for: classic loaf cake, bundt cake, financiers, madeleines (with brown butter), and any simple baked good where citrus zest, vanilla, almond, or poppy seed carries the flavour.',
  swaps:'Replace half the butter with cream cheese for a denser, tangier version.',
  recipeIds:[],
},
{
  id:'cookie-dough',name:'Cookie Dough',category:'Grains & Doughs',phase:1,type:'BISCUIT',
  formula:[
    {parts:1,label:'SUGAR',metricVal:75,metricUnit:'g'},
    {parts:2,label:'FAT',metricVal:150,metricUnit:'g'},
    {parts:3,label:'FLOUR',metricVal:225,metricUnit:'g'},
  ],
  technique:'By weight. The foundation for shortbread, drop cookies, and pressed biscuits. Brown sugar adds chew and spread; caster sugar keeps cookies crisper and more compact. Used for: shortbread fingers, butter cookies, slice-and-bake cookies, thumbprint biscuits, pressed Viennese whirls.',
  swaps:'Replace up to half the fat with nut butter for peanut or almond butter cookies.',
  recipeIds:[],
},
{
  id:'scones',name:'Biscuits & Scones',category:'Grains & Doughs',phase:1,type:'DOUGH',
  formula:[
    {parts:3,label:'FLOUR',metricVal:300,metricUnit:'g'},
    {parts:2,label:'LIQUID',metricVal:200,metricUnit:'ml'},
    {parts:1,label:'FAT',metricVal:100,metricUnit:'g'},
  ],
  technique:'Work the fat in cold and stop mixing the moment the dough comes together. Handle as little as possible — the less you work it, the flakier the result. Used for: buttermilk scones, cheese scones, American-style biscuits, drop scones — anything flaky, tender, and slightly crumbly with distinct layers.',
  swaps:'Buttermilk for regular milk activates the raising agents more effectively and adds flavour.',
  recipeIds:[],
},

];

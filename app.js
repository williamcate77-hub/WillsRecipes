// Cooking With Will — application logic.
// Framework-free, build-free: recipes.js + ratios.js provide the data,
// styles.css provides the design system, this file renders everything.

// Fail soft if a data file didn't load (flaky network mid-deploy): the app
// boots with what it has instead of dying on a ReferenceError.
if(typeof RECIPES==='undefined'||typeof CATEGORIES==='undefined'){
  console.error('recipes.js failed to load');
  window.RECIPES=window.RECIPES||[];window.CATEGORIES=window.CATEGORIES||[];
  document.addEventListener('DOMContentLoaded',()=>{
    const grid=document.getElementById('catGrid');
    if(grid)grid.innerHTML=`<div class="error-card" style="grid-column:1/-1"><span class="ms">skillet</span><h3>Recipes didn't load</h3><p>Check your connection and reload.</p><button class="empty-cta" onclick="location.reload()">Reload the app</button></div>`;
  });
}
const ALL_RECIPES=[...RECIPES];

// ── SAFE HTML HELPERS (all recipe strings pass through these before innerHTML)
function esc(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function jsArg(s){return String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");}

// ── ERROR BOUNDARY: render failures show a friendly card instead of a blank view
function guarded(fn,containerId){
  try{fn();}catch(e){
    console.error('Render failed:',e);
    const el=document.getElementById(containerId);
    if(el)el.innerHTML=`<div class="error-card"><span class="ms">skillet</span><h3>Something burnt</h3><p>This screen hit a snag. Try going back home.</p><button class="empty-cta" onclick="location.hash='';location.reload()">Reload the app</button></div>`;
  }
}

// ── STORAGE: hardened wrapper around localStorage.
// All keys are namespaced cww:*; reads/writes never throw (private browsing,
// quota, corrupted JSON all degrade gracefully).
const store={
  get(key,fallback){
    try{const v=localStorage.getItem(key);return v==null?fallback:JSON.parse(v);}
    catch(e){console.warn('store.get failed for',key,e);return fallback;}
  },
  set(key,val){
    try{localStorage.setItem(key,JSON.stringify(val));return true;}
    catch(e){
      console.warn('store.set failed for',key,e);
      if(e&&(e.name==='QuotaExceededError'||e.code===22))toast('Storage is full — changes may not be kept');
      return false;
    }
  },
  remove(key){try{localStorage.removeItem(key);}catch(e){}},
};
const K={saved:'cww:saved',list:'cww:list',prefs:'cww:prefs',recent:'cww:recent',notes:'cww:notes',cooking:'cww:cooking',dark:'cww:dark',ratios:'cww:ratios',migrated:'cww:migrated'};

// ── DUPLICATE-ID MIGRATION (data clean-ups removed duplicate recipes)
// 289 + 297–307 were double-imports of 204 / 286–296 (July 2026 sync)
const DUPLICATE_ID_MAP={251:192,253:194,237:198,236:199,221:257,222:269,223:271,224:272,225:268,226:267,227:270,
  289:204,297:287,298:286,299:288,300:204,301:290,302:291,303:292,304:293,305:294,306:295,307:296};
const mapId=id=>DUPLICATE_ID_MAP[id]||id;

// ── ONE-TIME MIGRATION from the un-namespaced keys used before v2.
// Nobody loses their saved recipes, shopping list or theme on update.
(function migrateLegacyKeys(){
  if(store.get(K.migrated,false))return;
  try{
    // saved recipes: was an array of ids; becomes [{id,ts}] so we can sort by recency
    const legacyPinned=store.get('pinned',null);
    if(legacyPinned&&!localStorage.getItem(K.saved)){
      const seen=new Set();
      const migrated=legacyPinned.map(mapId).filter(id=>id!==266&&!seen.has(id)&&seen.add(id))
        .map((id,i)=>({id,ts:i}));
      store.set(K.saved,migrated);
    }
    const legacyList=store.get('globalShopList',null);
    if(legacyList&&!localStorage.getItem(K.list))store.set(K.list,legacyList);
    if(localStorage.getItem('darkMode')!=null&&!localStorage.getItem(K.dark))store.set(K.dark,localStorage.getItem('darkMode')==='1');
    const legacyRatios=store.get('savedRatios',null);
    if(legacyRatios&&!localStorage.getItem(K.ratios))store.set(K.ratios,legacyRatios);
    const legacyCk=store.get('cookingState',null);
    if(legacyCk&&!localStorage.getItem(K.cooking)){legacyCk.id=mapId(legacyCk.id);store.set(K.cooking,legacyCk);}
    ['pinned','globalShopList','darkMode','savedRatios','cookingState'].forEach(k=>store.remove(k));
  }catch(e){console.warn('legacy migration failed',e);}
  store.set(K.migrated,true);
})();
// saved entries may predate the duplicate clean-up
(function migrateSavedIds(){
  const cur=store.get(K.saved,[]);
  const seen=new Set();
  const fixed=cur.map(e=>({...e,id:mapId(e.id)})).filter(e=>e.id!==266&&!seen.has(e.id)&&seen.add(e.id));
  if(JSON.stringify(fixed)!==JSON.stringify(cur))store.set(K.saved,fixed);
})();

// ── ENERGY DISPLAY (kJ leads for the AU audience)
function fmtEnergy(cal){
  const kj=Math.round(cal*4.184/10)*10;
  return`${kj.toLocaleString()} kJ / ${cal} cal`;
}
function fmtKj(cal){return`${(Math.round(cal*4.184/10)*10).toLocaleString()} kJ`;}

// ── CATEGORY METADATA: colour token + Material Symbol per category,
//    used consistently on cards, headers and metadata rows.
const CAT_META={
  'Dips & Starters':{v:'--cat-dips',icon:'tapas'},
  'Salads':{v:'--cat-salads',icon:'eco'},
  'Soups':{v:'--cat-soups',icon:'soup_kitchen'},
  'Seafood':{v:'--cat-seafood',icon:'set_meal'},
  'Meat & Poultry':{v:'--cat-meat',icon:'outdoor_grill'},
  'Vegetarian':{v:'--cat-veg',icon:'nutrition'},
  'Pasta & Rice':{v:'--cat-pasta',icon:'dinner_dining'},
  'Sides':{v:'--cat-sides',icon:'rice_bowl'},
  'Bread & Bakes':{v:'--cat-bread',icon:'bakery_dining'},
  'Sauces & Condiments':{v:'--cat-sauces',icon:'water_drop'},
  'Desserts':{v:'--cat-desserts',icon:'cake'},
  'New recipes':{v:'--cat-new',icon:'new_releases'},
};
// Pseudo-category: every recipe, newest first (ids are assigned in import order)
const NEW_RECIPES_CAT='New recipes';
function recipesForCategory(cat){
  return cat===NEW_RECIPES_CAT
    ?[...ALL_RECIPES].sort((a,b)=>b.id-a.id)
    :ALL_RECIPES.filter(r=>r.category===cat).sort((a,b)=>b.id-a.id);
}
function catVar(cat){return(CAT_META[cat]||{}).v||'--green';}
function catIcon(cat){return(CAT_META[cat]||{}).icon||'restaurant';}
function catStyle(cat){return`--cat:var(${catVar(cat)})`;}

// ── PROTEIN PAIRING DATA
const MAIN_CATS=new Set(['Meat & Poultry','Seafood']);
const SIDE_CATS=new Set(['Sides','Salads']);
const PROTEIN_GROUPS={
  chicken:['Chicken'],
  beef:['Beef','Steak'],
  lamb:['Lamb'],
  pork:['Pork','Sausages'],
  fish:['Fish','Mackerel','Sardines','Snapper','Dover Sole','Ling','Kingfish'],
  prawns:['Prawns','Shrimp'],
  salmon:['Salmon','Smoked Trout'],
  shellfish:['Scallops','Pipis','Shellfish','Clams','Mussels','Oysters','Seafood'],
};
const PROTEIN_SIDE_AFFINITY={
  chicken:['broccoli','bean','potato','sweet potato','kale','zucchini','corn','cauliflower','pumpkin','carrot','mushroom','pea','rice','greens'],
  beef:['potato','brussels','mushroom','broccoli','kale','bean','corn','cauliflower','squash'],
  lamb:['eggplant','pumpkin','cauliflower','pea','bean','carrot','zucchini','squash','kale'],
  pork:['corn','brussels','greens','cabbage','squash','pumpkin','bean'],
  fish:['bean','zucchini','asparagus','broccoli','cauliflower','greens','pea','potato','rice'],
  prawns:['corn','greens','zucchini','bean','broccoli','rice'],
  salmon:['sweet potato','kale','bean','broccoli','potato','asparagus'],
  shellfish:['corn','greens','bean','broccoli','cauliflower','rice'],
};
const PROTEIN_SALAD_AFFINITY={
  chicken:['lettuce','tomato','feta','kale','asparagus','chickpea','pumpkin','carrot','quinoa'],
  beef:['lettuce','tomato','bread','horseradish','beetroot','kale','farro'],
  lamb:['beetroot','lentil','feta','pomegranate','pumpkin','kale','farro','buckwheat'],
  pork:['kale','watermelon','fennel','carrot','bread'],
  fish:['butter bean','asparagus','trout','horseradish','lettuce','quinoa','wild rice'],
  prawns:['watermelon','asparagus','tomato','chickpea'],
  salmon:['butter bean','kale','asparagus','dill','horseradish','lentil'],
  shellfish:['lemon','herb','tomato','chickpea','wild rice'],
};
const SIDE_PROTEIN_PAIRINGS={
  'Potatoes':['chicken','beef','lamb','pork'],
  'Potato':['chicken','beef','lamb','pork'],
  'Sweet Potato':['chicken','salmon','fish'],
  'Brussels Sprouts':['beef','pork','chicken'],
  'Corn':['chicken','prawns','pork'],
  'Broccoli':['beef','chicken','fish'],
  'Eggplant':['lamb','chicken'],
  'Cauliflower':['chicken','fish','lamb'],
  'Kale':['chicken','salmon','fish'],
  'Zucchini':['fish','chicken','prawns'],
  'Green Beans':['chicken','fish','lamb'],
  'Pumpkin':['chicken','lamb','beef'],
  'Carrots':['lamb','chicken','beef'],
  'Mushrooms':['beef','chicken'],
  'Peas':['lamb','chicken','fish'],
  'Brown Rice':['chicken','fish','prawns'],
  'Beans':['fish','chicken','lamb'],
  'Butter Beans':['fish','chicken'],
  'Greens':['chicken','fish','prawns','shellfish'],
  'Squash':['chicken','lamb','beef'],
  'Cabbage':['pork','beef','chicken'],
  'Asparagus':['fish','salmon','chicken','prawns'],
};
const SALAD_PROTEIN_PAIRINGS={
  'Lettuce':['chicken','beef','fish'],
  'Tomatoes':['chicken','beef','lamb','fish'],
  'Chickpeas':['chicken','lamb'],
  'Kale':['chicken','salmon','fish'],
  'Lentils':['lamb','chicken'],
  'Beetroot':['lamb','beef','chicken'],
  'Pumpkin':['chicken','lamb'],
  'Asparagus':['fish','salmon','prawns','chicken'],
  'Smoked Trout':['salmon','fish'],
  'Watermelon':['prawns','pork'],
  'Quinoa':['chicken','fish'],
  'Farro':['chicken','lamb','beef'],
  'Wild Rice':['chicken','fish','prawns'],
  'Carrots':['chicken','lamb','beef'],
  'Buckwheat':['chicken','lamb'],
  'Flatbread':['chicken','lamb','beef'],
  'Butter Beans':['fish','chicken'],
};

// ── AISLE MAP (icons, not emoji)
const AISLES=[
  {name:'Produce',icon:'eco',kw:['onion','garlic','tomato','lettuce','spinach','lemon','lime','basil','parsley','thyme','rosemary','mint','coriander','mushroom','capsicum','zucchini','eggplant','broccoli','kale','cucumber','celery','carrot','beetroot','pumpkin','potato','avocado','spring onion','leek','chilli','ginger','fennel','asparagus','pea','corn','bean','cauliflower','cabbage','shallot','radish','rocket','bok choy','silverbeet','herb','sage','dill','chive','fruit','berr','grape','cherry','peach','plum','fig','watermelon','mango']},
  {name:'Meat & Seafood',icon:'set_meal',kw:['chicken','beef','lamb','pork','salmon','tuna','prawn','fish','scallop','oyster','mussel','clam','bacon','sausage','mince','steak','fillet','duck','anchovy','sardine','mackerel','snapper','trout','sole','squid']},
  {name:'Dairy & Eggs',icon:'egg',kw:['egg','milk','cream','butter','cheese','yoghurt','yogurt','feta','ricotta','parmesan','mozzarella','burrata','haloumi','halloumi','mascarpone','brie','cheddar','sour cream','ghee']},
  {name:'Bread & Bakery',icon:'bakery_dining',kw:['bread','sourdough','pita','flatbread','roll','bun','tortilla','crouton','baguette','ciabatta','focaccia','bagel','wrap','pastry']},
  {name:'Pantry',icon:'kitchen',kw:['pasta','rice','flour','lentil','chickpea','bean','quinoa','farro','barley','oat','couscous','noodle','breadcrumb','panko','canned','tinned','stock','broth','coconut milk','tomato paste','crushed tomato','brown rice','wild rice','buckwheat','polenta']},
  {name:'Condiments & Spices',icon:'water_drop',kw:['oil','vinegar','soy','fish sauce','tahini','honey','mustard','maple','miso','harissa','sriracha','salt','pepper','sugar','cumin','paprika','turmeric','cinnamon','curry','garam masala','sumac','zaatar','dukkah','vanilla','cocoa','chilli flake','star anise','cardamom','spice','sauce','dressing','paste','seasoning']},
  {name:'Nuts & Seeds',icon:'grain',kw:['nut','almond','walnut','pine nut','cashew','pistachio','hazelnut','peanut','seed','sesame','pepita','sunflower','flaxseed','chia','pecan']},
  {name:'Deli & Specialty',icon:'tapas',kw:['prosciutto','salami','ham','smoked','pancetta','chorizo','capers','olive','sundried','truffle','balsamic','tofu','tempeh']},
];
const AISLE_OTHER='Other';
function getAisle(n){const lc=n.toLowerCase();for(const a of AISLES){if(a.kw.some(k=>lc.includes(k)))return a.name;}return AISLE_OTHER;}
function aisleIcon(name){const a=AISLES.find(x=>x.name===name);return a?a.icon:'shopping_bag';}

// ── SCALING RULES (how units scale with portion size)
const SCALING_RULES={
  'pinch':{type:'fixed'},'handful':{type:'fixed'},'bunch':{type:'fixed'},'bunches':{type:'fixed'},
  'sprigs':{type:'fixed'},'sprig':{type:'fixed'},'to taste':{type:'fixed'},'to serve':{type:'fixed'},
  'clove':{type:'stepped',steps:[0.5,1,2,3,4,6,8]},'cloves':{type:'stepped',steps:[0.5,1,2,3,4,6,8]},
  'whole':{type:'stepped',steps:[0.5,1,2,3,4,6,8]},'fillet':{type:'stepped',steps:[1,2,3,4,6,8]},
  'fillets':{type:'stepped',steps:[1,2,3,4,6,8]},'leaf':{type:'stepped',steps:[1,2,4,6,8,10]},
  'leaves':{type:'stepped',steps:[1,2,4,6,8,10]},'rasher':{type:'stepped',steps:[1,2,3,4,6,8]},
  'rashers':{type:'stepped',steps:[1,2,3,4,6,8]},'sheet':{type:'stepped',steps:[1,2,3,4]},
  'sheets':{type:'stepped',steps:[1,2,3,4]},'yolk':{type:'stepped',steps:[1,2,3,4,6,8]},
  'yolks':{type:'stepped',steps:[1,2,3,4,6,8]},'cup':{type:'linear'},'cups':{type:'linear'},
  'g':{type:'linear'},'kg':{type:'linear'},'ml':{type:'linear'},'tbsp':{type:'linear'},'tsp':{type:'linear'},
  'l':{type:'linear'},'litre':{type:'linear'},'litres':{type:'linear'},
  'slice':{type:'stepped',steps:[1,2,3,4,6,8]},'slices':{type:'stepped',steps:[1,2,3,4,6,8]},
  'piece':{type:'stepped',steps:[1,2,3,4,6]},'pieces':{type:'stepped',steps:[1,2,3,4,6]},
  'small':{type:'stepped',steps:[0.5,1,2,3,4,6]},'medium':{type:'stepped',steps:[0.5,1,2,3,4,6]},
  'large':{type:'stepped',steps:[0.5,1,2,3,4,6]},
  'lemon':{type:'stepped',steps:[0.5,1,2,3,4]},'lemons':{type:'stepped',steps:[0.5,1,2,3,4]},
  'lime':{type:'stepped',steps:[0.5,1,2,3,4]},'orange':{type:'stepped',steps:[0.5,1,2,3,4]},
  'pomegranate':{type:'stepped',steps:[0.5,1,2,3]},'punnet':{type:'stepped',steps:[0.5,1,2,3]},
  'stalk':{type:'stepped',steps:[1,2,3,4,6]},'stalks':{type:'stepped',steps:[1,2,3,4,6]},
  'tin':{type:'stepped',steps:[1,2,3,4]},'tins':{type:'stepped',steps:[1,2,3,4]},
  'loaf':{type:'stepped',steps:[0.5,1,2]},'scoop':{type:'stepped',steps:[1,2,3,4]},
  'head':{type:'stepped',steps:[0.5,1,2,3]},'small head':{type:'stepped',steps:[0.5,1,2,3]},
  'whole head':{type:'stepped',steps:[0.5,1,2,3]},'whole heads':{type:'stepped',steps:[0.5,1,2,3]},
  'splash':{type:'fixed'},'thumb':{type:'fixed'},
  'part':{type:'linear'},'parts':{type:'linear'},'slug':{type:'fixed'},'small slug':{type:'fixed'},
};
function scaleAmount(amount,unit,scale){
  const rule=SCALING_RULES[(unit||'').toLowerCase()]||{type:'linear'};
  if(rule.type==='fixed')return amount;
  if(rule.type==='stepped'){
    const scaled=amount*scale;
    return rule.steps.reduce((a,b)=>Math.abs(a-scaled)<Math.abs(b-scaled)?a:b);
  }
  return amount*scale;
}

// ── STATE
function haptic(ms=8){if(navigator.vibrate)navigator.vibrate(ms)}
let currentTab='home',currentRecipe=null,prevTab='home',isDark=false;
let saved=store.get(K.saved,[]); // [{id,ts}] most-recent has highest ts
let prefs=store.get(K.prefs,{});
let notes=store.get(K.notes,{});
let recentIds=store.get(K.recent,[]);
let activeChip='All',activeSearch='',shopChecked={},stepsDone={},portionScale=1;
let wakeLock=null,shopSort='aisle';
let globalShopList=store.get(K.list,[]);
let activeCategory=null; // null = category grid, string = open category view
const APP_VERSION='2.0';
function isSaved(id){return saved.some(e=>e.id===id);}
function saveSaved(){store.set(K.saved,saved);}
// migrate aisle names stored by the previous version (emoji prefixes)
(function migrateAisleNames(){
  let changed=false;
  globalShopList.forEach(i=>{
    if(i.aisle&&/^[^A-Za-z]/.test(i.aisle)){i.aisle=i.aisle.replace(/^[^A-Za-z]+/,'').trim()||getAisle(i.name);changed=true;}
    if(i.aisle==='🛒 Other'||i.aisle==='Other ')i.aisle=AISLE_OTHER;
  });
  if(changed)saveGlobalShopList();
})();

// ── COOKING STATE
let cookingRecipe=null,cookingStep=0,ckTimerSecs=0,ckTimerInterval=null,ckTimerRunning=false;
function saveCookingState(){
  if(!cookingRecipe)return;
  store.set(K.cooking,{id:cookingRecipe.id,step:cookingStep,ts:Date.now()});
}
function getCookingState(){
  const s=store.get(K.cooking,null);
  if(!s||typeof s.id!=='number'||typeof s.step!=='number'){store.remove(K.cooking);return null;}
  if(Date.now()-s.ts>24*3600*1000){store.remove(K.cooking);return null;}
  s.id=mapId(s.id); // saved mid-cook state may reference a deduped recipe
  return s;
}
function clearCookingState(){store.remove(K.cooking);cookingRecipe=null;cookingStep=0;}

// ── DARK MODE
function toggleMode(){
  haptic(8);isDark=!isDark;
  document.documentElement.classList.toggle('dark',isDark);
  document.getElementById('modeIcon').textContent=isDark?'light_mode':'dark_mode';
  store.set(K.dark,isDark);
}
(function(){
  if(store.get(K.dark,false)){isDark=true;document.documentElement.classList.add('dark');document.getElementById('modeIcon').textContent='light_mode';}
})();

// ── RECIPE VALIDATION (runtime guard, dev aid)
function validateAllRecipes(){
  const issues=[];
  for(const r of ALL_RECIPES){
    const errs=[];
    if(!CATEGORIES.includes(r.category))errs.push(`Category "${r.category}" is not in CATEGORIES`);
    (r.ingredients||[]).forEach(ing=>{
      if(!ing.section&&!SCALING_RULES[(ing.unit||'').toLowerCase()])
        errs.push(`Unknown unit "${ing.unit}" in ${ing.name}`);
    });
    if(errs.length)issues.push({r,errs});
  }
  issues.forEach(({r,errs})=>console.error(`Recipe #${r.id} ${r.name}:`,errs));
  return issues;
}

// ── SEARCH
let _st=null;
function onSearch(){
  clearTimeout(_st);
  _st=setTimeout(()=>{
    activeSearch=document.getElementById('searchInput').value.trim().toLowerCase();
    const clr=document.getElementById('searchClear');
    if(clr)clr.style.display=activeSearch?'flex':'none';
    document.getElementById('searchIcon').textContent=activeSearch?'manage_search':'search';
    if(activeSearch)activeCategory=null;
    renderHomeMode();
  },300);
}
function clearSearch(){
  activeSearch='';document.getElementById('searchInput').value='';
  document.getElementById('searchClear').style.display='none';
  document.getElementById('searchIcon').textContent='search';
  renderHomeMode();
}
function clearFilters(){
  activeSearch='';activeChip='All';activeCategory=null;
  document.getElementById('searchInput').value='';
  document.getElementById('searchClear').style.display='none';
  document.getElementById('searchIcon').textContent='search';
  renderHomeMode();
}

// ── CATEGORY CHIPS (refine search results)
function renderChips(){
  const row=document.getElementById('chipsRow');if(!row)return;
  const cats=['All',...CATEGORIES];
  row.innerHTML=cats.map(c=>`<button class="chip${activeChip===c?' active':''}" onclick="setChip('${jsArg(c)}')">
    ${c==='All'?'All':`<span class="ms">${catIcon(c)}</span>${esc(c)}`}
  </button>`).join('');
}
function setChip(cat){haptic(6);activeChip=cat;renderHomeMode();}

// ── INGREDIENT SEARCH MATCH
// Excludes derived forms — "chicken stock" should not match a search for "chicken"
const DERIVED_SUFFIXES=['stock','broth','oil','sauce','paste','powder','juice','extract','vinegar','butter','cream','mince'];
function ingMatchesQuery(ingName,q){
  const n=ingName.toLowerCase();
  if(!n.includes(q))return false;
  return!DERIVED_SUFFIXES.some(d=>n.includes(d));
}
function getFiltered(){
  let list=[...ALL_RECIPES].sort((a,b)=>b.id-a.id);
  if(activeSearch){
    const q=activeSearch;
    list=list.filter(r=>r.name.toLowerCase().includes(q)||r.category.toLowerCase().includes(q)||r.mainIngredient.toLowerCase().includes(q)||(r.ingredients&&r.ingredients.some(i=>i.name&&ingMatchesQuery(i.name,q))));
  }
  if(activeChip&&activeChip!=='All')list=list.filter(r=>r.category===activeChip);
  return list;
}

// ── HOME DISPATCHER: grid (default) | category view | search results
function renderHomeMode(){
  const searching=!!activeSearch;
  document.getElementById('homeRoot').style.display=(!searching&&!activeCategory)?'block':'none';
  document.getElementById('homeCategory').style.display=(activeCategory&&!searching)?'block':'none';
  document.getElementById('homeFeedWrap').style.display=searching?'block':'none';
  document.getElementById('chipsRow').style.display=searching?'':'none';
  const banner=document.getElementById('continueBanner');
  if(banner)banner.style.display='none';
  if(searching){guarded(renderChips,'chipsRow');guarded(renderFeed,'homeFeed');}
  else if(activeCategory){guarded(renderCategoryView,'homeCategory');}
  else{guarded(renderContinueBanner,'view-home');guarded(renderJumpBack,'homeRoot');guarded(renderHomeGrid,'homeRoot');}
}
function renderHome(){renderHomeMode();}

// ── HOME GRID
function renderHomeGrid(){
  const grid=document.getElementById('catGrid');
  const newCard=`<div class="cat-card" style="${catStyle(NEW_RECIPES_CAT)}" onclick="openCategory('${jsArg(NEW_RECIPES_CAT)}')" role="button" tabindex="0">
      <span class="ms">${catIcon(NEW_RECIPES_CAT)}</span>
      <div class="cat-card-name">${esc(NEW_RECIPES_CAT)}</div>
      <div class="cat-card-count">Latest additions first</div>
    </div>`;
  grid.innerHTML=newCard+CATEGORIES.map(cat=>{
    const n=ALL_RECIPES.filter(r=>r.category===cat).length;
    return`<div class="cat-card" style="${catStyle(cat)}" onclick="openCategory('${jsArg(cat)}')" role="button" tabindex="0">
      <span class="ms">${catIcon(cat)}</span>
      <div class="cat-card-name">${esc(cat)}</div>
      <div class="cat-card-count">${n} recipe${n===1?'':'s'}</div>
    </div>`;
  }).join('');
  const total=document.getElementById('catGridCount');
  if(total)total.textContent=`${ALL_RECIPES.length} recipes`;
}

// ── CATEGORY VIEW
function openCategory(cat){
  haptic(6);activeCategory=cat;activeChip='All';
  renderHomeMode();
  const v=document.getElementById('homeCategory');
  v.classList.remove('slide-in');void v.offsetWidth;v.classList.add('slide-in');
  document.getElementById('main').scrollTop=0;
}
function closeCategory(){haptic(6);activeCategory=null;renderHomeMode();}
function renderCategoryView(){
  const cat=activeCategory;if(!cat)return;
  const recipes=recipesForCategory(cat);
  const hero=document.getElementById('catHero');
  hero.style.cssText=catStyle(cat);
  hero.innerHTML=`
    <div class="cat-hero-top">
      <button class="back-pill" onclick="closeCategory()"><span class="ms">arrow_back</span>Home</button>
    </div>
    <span class="ms cat-hero-icon">${catIcon(cat)}</span>
    <h2>${esc(cat)}</h2>
    <div class="cnt">${recipes.length} recipe${recipes.length===1?'':'s'}</div>`;
  document.getElementById('catList').innerHTML=recipes.map(r=>recipeCard(r)).join('');
}

// ── SEARCH RESULTS FEED
function renderFeed(){
  const recipes=getFiltered();
  const feed=document.getElementById('homeFeed');
  const empty=document.getElementById('homeEmpty');
  document.getElementById('feedHdrTitle').textContent=`Results for "${activeSearch}"`;
  document.getElementById('feedHdrCount').textContent=`${recipes.length} recipe${recipes.length===1?'':'s'}`;
  if(!recipes.length){feed.innerHTML='';empty.style.display='flex';return;}
  empty.style.display='none';
  feed.innerHTML=recipes.map(r=>recipeCard(r)).join('');
}

// ── CONTINUE COOKING
function renderContinueBanner(){
  const state=getCookingState();const banner=document.getElementById('continueBanner');
  if(!state){banner.style.display='none';return;}
  const r=ALL_RECIPES.find(x=>x.id===state.id);
  if(!r){banner.style.display='none';return;}
  document.getElementById('continueBannerTitle').textContent=r.name;
  document.getElementById('continueBannerStep').textContent=`Step ${state.step+1} of ${r.steps.length}`;
  banner.style.display='flex';
}
function resumeCooking(){
  const state=getCookingState();if(!state)return;
  const r=ALL_RECIPES.find(x=>x.id===state.id);if(!r)return;
  currentRecipe=r;cookingStep=state.step;openCookingMode(r,cookingStep);
}

// ── RECIPE CARD (category colour accent + one metadata row)
function metaRow(r){
  return`<div class="rcrd-meta">
    <span class="meta-bit"><span class="ms">schedule</span>${esc(r.time)}</span>
    <span class="meta-bit diff-${esc(r.difficulty)}"><span class="ms">signal_cellular_alt</span>${cap(r.difficulty)}</span>
    <span class="meta-bit"><span class="ms">group</span>${r.serves}</span>
    <span class="meta-bit"><span class="ms">bolt</span>${fmtKj(r.caloriesPerServe)}</span>
  </div>`;
}
function recipeCard(r,showSave=true){
  const ip=isSaved(r.id);
  return`<div class="rcrd" style="${catStyle(r.category)}">
    <div class="rcrd-inner" onclick="openRecipe(${r.id})">
      <div class="rcrd-name">${esc(r.name)}</div>
      ${metaRow(r)}
    </div>
    ${showSave?`<button class="rcrd-save${ip?' saved':''}" id="rsb-${r.id}" onclick="togglePin(${r.id})" aria-label="Save recipe"><span class="ms">bookmark</span><span class="slbl">${ip?'Saved':'Save'}</span></button>`:''}
  </div>`;
}

// ── SAVED VIEW (most recently saved first, personalised header)
function possessive(name){return/s$/i.test(name)?name+"'":name+"'s";}
function renderSaved(){
  const hdr=document.getElementById('savedHdrTitle');
  if(hdr)hdr.textContent=prefs.name?`${possessive(prefs.name)} cookbook`:'Saved Recipes';
  const list=document.getElementById('savedList');const empty=document.getElementById('savedEmpty');
  const byRecency=[...saved].sort((a,b)=>(b.ts||0)-(a.ts||0));
  const pr=byRecency.map(e=>ALL_RECIPES.find(r=>r.id===e.id)).filter(Boolean);
  const settings=document.getElementById('savedSettings');
  if(settings)settings.style.display='';
  if(!pr.length){list.innerHTML='';empty.style.display='flex';return;}
  empty.style.display='none';list.innerHTML=pr.map(r=>recipeCard(r)).join('');
}

// ── PIN / SAVE (with count badge + press feedback)
function updateSavedBadge(){
  const b=document.getElementById('savedBadge');
  if(b){b.textContent=saved.length||'';b.classList.toggle('show',saved.length>0);}
}
function togglePin(id){
  haptic(12);
  const was=isSaved(id);
  if(was)saved=saved.filter(e=>e.id!==id);else saved.push({id,ts:Date.now()});
  saveSaved();updateSavedBadge();
  const is=isSaved(id);
  ['rsb-','savebtn-'].forEach(prefix=>{
    const btn=document.getElementById(prefix+id);
    if(btn){btn.classList.toggle('saved',is);const lbl=btn.querySelector('.slbl');if(lbl)lbl.textContent=is?'Saved':'Save';btn.classList.add('pop');setTimeout(()=>btn.classList.remove('pop'),300);}
  });
  if(currentTab==='saved')renderSaved();
  if(currentTab==='detail')renderNoteSection();
  if(is){const r=ALL_RECIPES.find(x=>x.id===id);if(r)gtag('event','save_recipe',{recipe_name:r.name,recipe_category:r.category});}
  toast(is?'Saved to your collection':'Removed from saved');
}
function togglePinDetail(){if(!currentRecipe)return;haptic(12);togglePin(currentRecipe.id);updateDetPin();}
function updateDetPin(){
  const ip=isSaved(currentRecipe.id);
  const btn=document.getElementById('detPinBtn');if(btn)btn.classList.toggle('saved',ip);
}

// ── PRIVATE NOTES on saved recipes
let _noteTimer=null;
function renderNoteSection(){
  const sec=document.getElementById('noteSec');if(!sec||!currentRecipe)return;
  const show=isSaved(currentRecipe.id);
  sec.style.display=show?'':'none';
  if(show)document.getElementById('noteBox').value=notes[currentRecipe.id]||'';
}
function onNoteInput(){
  if(!currentRecipe)return;
  clearTimeout(_noteTimer);
  const id=currentRecipe.id;
  _noteTimer=setTimeout(()=>{
    const v=document.getElementById('noteBox').value.trim();
    if(v)notes[id]=v;else delete notes[id];
    store.set(K.notes,notes);
  },500);
}

// ── RECENTLY VIEWED ("Jump back in")
function trackRecent(id){
  recentIds=[id,...recentIds.filter(x=>x!==id)].slice(0,5);
  store.set(K.recent,recentIds);
}
function renderJumpBack(){
  const row=document.getElementById('jumpRow');const lbl=document.getElementById('jumpLbl');
  if(!row)return;
  const recs=recentIds.map(id=>ALL_RECIPES.find(r=>r.id===id)).filter(Boolean);
  row.style.display=recs.length?'':'none';
  lbl.style.display=recs.length?'':'none';
  row.innerHTML=recs.map(r=>`<div class="jump-card" style="${catStyle(r.category)}" onclick="openRecipe(${r.id})">
    <div class="jump-card-name">${esc(r.name)}</div>
    <div class="jump-card-meta"><span class="ms">schedule</span>${esc(r.time)}</div>
  </div>`).join('');
}

// ── RECIPE DETAIL
function openRecipe(id){
  haptic(8);
  const r=ALL_RECIPES.find(x=>x.id===id);
  if(!r)return;
  currentRecipe=r;prevTab=currentTab==='detail'?prevTab:currentTab;
  trackRecent(id);
  gtag('event','view_recipe',{recipe_name:r.name,recipe_category:r.category,recipe_difficulty:r.difficulty});
  if(!shopChecked[id])shopChecked[id]=new Set();
  if(!stepsDone[id])stepsDone[id]=new Set();
  const def=2;
  const slider=document.getElementById('portionSlider');
  slider.value=def;slider.max=Math.max(12,r.serves*3);
  portionScale=def/r.serves;
  document.getElementById('portionVal').textContent=def;
  guarded(renderDetailContent,'view-detail');
  document.querySelectorAll('.view').forEach(v=>{v.style.display='none';v.classList.remove('active')});
  const v=document.getElementById('view-detail');v.style.display='block';v.classList.add('active');
  document.getElementById('appHdr').style.display='none';
  document.getElementById('tabBar').style.display='none';
  currentTab='detail';
  document.getElementById('main').scrollTop=0;
}

function renderDetailContent(){
  const r=currentRecipe;
  const hero=document.getElementById('detHero');
  hero.style.cssText=catStyle(r.category);
  hero.innerHTML=`
    <div class="det-hero-top">
      <button class="det-btn" onclick="closeDetail()" aria-label="Back"><span class="ms">arrow_back</span></button>
      <div class="det-actions">
        <button class="det-btn${isSaved(r.id)?' saved':''}" id="detPinBtn" onclick="togglePinDetail()" aria-label="Save"><span class="ms">bookmark</span></button>
        <button class="det-btn" onclick="shareRecipe()" aria-label="Share"><span class="ms">ios_share</span></button>
      </div>
    </div>
    <div class="det-hero-cat"><span class="ms">${catIcon(r.category)}</span>${esc(r.category)}</div>
    <h2 class="det-hero-title">${esc(r.name)}</h2>
    <div class="det-meta-strip">
      <span class="meta-bit"><span class="ms">schedule</span>${esc(r.time)}</span>
      <span class="meta-bit"><span class="ms">signal_cellular_alt</span>${cap(r.difficulty)}</span>
      <span class="meta-bit"><span class="ms">bolt</span>${fmtEnergy(r.caloriesPerServe)} / serve</span>
    </div>`;
  document.getElementById('detBody').style.cssText=catStyle(r.category);
  renderIngredients();renderSteps();renderShopList();renderWorksWellWith();renderNoteSection();
}

// merge the structured prep field with any prep embedded after a comma in the name
function extractPrepAndName(ing){
  const parts=String(ing.name||'').split(',').map(p=>p.trim());
  const prep=[parts.slice(1).join(', ')||null,ing.prep||null].filter(Boolean).join(', ')||null;
  return{name:parts[0],prep};
}

function ingRowHtml(ing,scaleVal){
  const scaled=scaleAmount(ing.amount,ing.unit,scaleVal);
  const display=fmtIng(scaled,ing.unit);
  const{name,prep}=extractPrepAndName(ing);
  return`<div class="ing-row"><div class="ing-dot"></div><span class="ing-name">${esc(dispName(name))}${prep?`<span class="ing-prep">${esc(prep)}</span>`:''}</span><span class="ing-amt">${esc(display)}</span></div>`;
}

function renderIngredients(){
  const r=currentRecipe;
  document.getElementById('ingList').innerHTML=r.ingredients.map(ing=>{
    if(ing.section)return`<div class="ing-section">${esc(ing.section)}</div>`;
    return ingRowHtml(ing,portionScale);
  }).join('');
}

// Scale numbers in step text when portion changes (e.g. "500 ml" → "250 ml" at ×0.5)
function scaleStepText(text,scale){
  if(Math.abs(scale-1)<0.01)return text;
  return text.replace(/\b(\d+(?:\.\d+)?)\s*(g|kg|ml|L|tbsp|tsp|cups?)\b/gi,(match,num,unit)=>{
    const scaled=parseFloat(num)*scale;
    const u=unit.toLowerCase().replace(/s$/,'');
    return fmtIng(scaled,u==='l'?'L':u);
  });
}

function renderSteps(){
  const done=stepsDone[currentRecipe.id];
  document.getElementById('stepsList').innerHTML=currentRecipe.steps.map((s,i)=>`
    <div class="step-item${done.has(i)?' done':''}" onclick="toggleStep(${i})">
      <div class="step-num">${done.has(i)?'<span class="ms" style="font-size:18px">check</span>':i+1}</div>
      <div class="step-text-wrap"><div class="step-text">${esc(scaleStepText(s,portionScale))}</div></div>
    </div>`).join('');
}
function toggleStep(i){
  haptic(8);const d=stepsDone[currentRecipe.id];const was=d.has(i);
  if(was)d.delete(i);else d.add(i);renderSteps();
  if(!was){setTimeout(()=>{const steps=document.querySelectorAll('.step-item');const next=steps[i+1];if(next)next.scrollIntoView({behavior:'smooth',block:'center'});},300);}
}

function renderShopList(){
  const c=shopChecked[currentRecipe.id];
  document.getElementById('shopList').innerHTML=currentRecipe.ingredients.map((ing,i)=>{
    if(ing.section)return'';
    const display=fmtIng(scaleAmount(ing.amount,ing.unit,portionScale),ing.unit);const checked=c.has(i);
    const{name}=extractPrepAndName(ing);
    return`<div class="shop-row${checked?' done':''}" onclick="toggleShop(${i})"><div class="shop-chk"><svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><div style="flex:1"><div class="shop-iname">${esc(dispName(name))}</div></div><span class="shop-amt">${esc(display)}</span></div>`;
  }).join('');
}
function toggleShop(i){haptic(8);const c=shopChecked[currentRecipe.id];if(c.has(i))c.delete(i);else c.add(i);renderShopList();}

// ── PROTEIN PAIRING
function getProteinGroup(mainIngredient){
  if(!mainIngredient)return null;
  const mi=mainIngredient.toLowerCase();
  for(const[group,ingredients]of Object.entries(PROTEIN_GROUPS)){
    if(ingredients.some(i=>mi.includes(i.toLowerCase())))return group;
  }
  return null;
}
function getWorksWellWith(recipe){
  const isMain=MAIN_CATS.has(recipe.category);
  const isSide=SIDE_CATS.has(recipe.category);
  if(!isMain&&!isSide)return[];
  if(isMain){
    const pg=getProteinGroup(recipe.mainIngredient);
    if(!pg)return[];
    const sideKws=PROTEIN_SIDE_AFFINITY[pg]||[];
    const saladKws=PROTEIN_SALAD_AFFINITY[pg]||[];
    const scored=ALL_RECIPES
      .filter(r=>r.id!==recipe.id&&SIDE_CATS.has(r.category))
      .map(r=>{
        const kws=r.category==='Sides'?sideKws:saladKws;
        const text=[r.mainIngredient||'',...r.ingredients.map(i=>i.name||'')].join(' ').toLowerCase();
        const score=kws.reduce((s,kw)=>s+(text.includes(kw)?1:0),0);
        return{r,score};
      })
      .filter(({score})=>score>0)
      .sort((a,b)=>b.score-a.score);
    const sides=scored.filter(({r})=>r.category==='Sides');
    const salads=scored.filter(({r})=>r.category==='Salads');
    const result=[];
    if(sides.length&&salads.length){
      result.push(sides[0].r,salads[0].r);
      if(sides.length>1)result.push(sides[1].r);
      else if(salads.length>1)result.push(salads[1].r);
    }else{
      result.push(...scored.slice(0,3).map(({r})=>r));
    }
    return result.slice(0,3);
  }else{
    const affinityTable=recipe.category==='Sides'?SIDE_PROTEIN_PAIRINGS:SALAD_PROTEIN_PAIRINGS;
    const compatibleProteins=affinityTable[recipe.mainIngredient]||[];
    if(!compatibleProteins.length)return[];
    const scored=ALL_RECIPES
      .filter(r=>MAIN_CATS.has(r.category)&&r.id!==recipe.id)
      .map(r=>{
        const pg=getProteinGroup(r.mainIngredient);
        const pos=compatibleProteins.indexOf(pg);
        return{r,score:pos>=0?compatibleProteins.length-pos:0,pg};
      })
      .filter(({score})=>score>0)
      .sort((a,b)=>b.score-a.score);
    const seen=new Set();const result=[];
    for(const{r,pg}of scored){if(!seen.has(pg)){seen.add(pg);result.push(r);}if(result.length>=3)break;}
    return result;
  }
}
function renderWorksWellWith(){
  const recs=getWorksWellWith(currentRecipe);
  const container=document.getElementById('worksWellWith');
  if(!container)return;
  container.style.display=recs.length?'':'none';
  if(!recs.length)return;
  document.getElementById('wwwRow').innerHTML=recs.map(r=>`<div class="www-card" style="${catStyle(r.category)}" onclick="openRecipe(${r.id})"><div class="www-card-body"><div class="www-card-cat"><span class="ms">${catIcon(r.category)}</span>${esc(r.category)}</div><div class="www-card-name">${esc(r.name)}</div><div class="www-card-meta">${esc(r.time)}&nbsp;·&nbsp;${cap(r.difficulty)}</div></div></div>`).join('');
}

// ── SHOPPING LIST ADDS
function addAllToList(){
  haptic(12);if(!currentRecipe)return;
  const added=mergeIntoShopList(currentRecipe.ingredients,currentRecipe.name,portionScale);
  saveGlobalShopList();updateShopBadge();
  toast(`Added ${added} item${added===1?'':'s'} to your list`);
}
function addToShoppingListFiltered(){
  haptic(12);if(!currentRecipe)return;
  const c=shopChecked[currentRecipe.id];
  const toBuy=currentRecipe.ingredients.filter((ing,i)=>!ing.section&&!c.has(i));
  if(!toBuy.length){toast('Nothing to add — everything is ticked!');return;}
  const added=mergeIntoShopList(toBuy,currentRecipe.name,portionScale);
  saveGlobalShopList();updateShopBadge();
  gtag('event','add_to_shoplist',{recipe_name:currentRecipe.name,recipe_category:currentRecipe.category,items_added:added});
  toast(`Added ${added} item${added===1?'':'s'} to your list`);
}
function normaliseIngName(name){return name.split(',')[0].trim().toLowerCase();}
function mergeIntoShopList(ingredients,recipeName,scale){
  let added=0;
  ingredients.forEach(ing=>{
    if(ing.section)return;
    if(/^water\b|^water\s*\(/i.test(ing.name))return;
    if(/^ice\b/i.test(ing.name))return;
    const norm=normaliseIngName(ing.name);
    const scaled=scaleAmount(ing.amount,ing.unit,scale);
    const amt=fmtIng(scaled,ing.unit);
    const existing=globalShopList.find(x=>normaliseIngName(x.name)===norm);
    if(existing){
      existing.recipes=existing.recipes||[existing.recipe];
      if(!existing.recipes.includes(recipeName))existing.recipes.push(recipeName);
      existing.recipe=existing.recipes.join(', ');
    } else {
      globalShopList.push({name:ing.name,amount:amt,recipe:recipeName,aisle:getAisle(ing.name),checked:false});
      added++;
    }
  });
  return added;
}

function closeDetail(dh=true){
  if(dh)haptic(8);
  currentRecipe=null;
  document.getElementById('appHdr').style.display='';
  document.getElementById('tabBar').style.display='';
  const target=prevTab==='detail'?'home':prevTab;
  showTab(target);
}

function onPortion(){
  haptic(6);const n=parseInt(document.getElementById('portionSlider').value);
  const el=document.getElementById('portionVal');el.classList.add('fade');
  setTimeout(()=>{portionScale=n/currentRecipe.serves;el.textContent=n;el.classList.remove('fade');renderIngredients();renderShopList();renderSteps();},140);
}
function adjustPortion(delta){
  haptic(6);const slider=document.getElementById('portionSlider');
  let n=parseInt(slider.value)+delta;
  n=Math.max(1,Math.min(parseInt(slider.max),n));
  slider.value=n;
  onPortion();
}

// ── COOKING MODE
function startCooking(){
  if(!currentRecipe)return;haptic(12);
  gtag('event','start_cooking',{recipe_name:currentRecipe.name,recipe_category:currentRecipe.category});
  cookingRecipe=currentRecipe;cookingStep=0;
  openCookingMode(cookingRecipe,0);
}
function openCookingMode(recipe,step){
  cookingRecipe=recipe;cookingStep=step;
  document.getElementById('cookingView').classList.remove('hidden');
  document.getElementById('appHdr').style.display='none';
  document.getElementById('tabBar').style.display='none';
  if(navigator.wakeLock){
    navigator.wakeLock.request('screen').then(w=>{wakeLock=w;updateWakeLockUI(true);w.addEventListener('release',()=>{wakeLock=null;updateWakeLockUI(false);});}).catch(()=>{updateWakeLockUI(false);});
  } else {updateWakeLockUI(false);}
  guarded(renderCookingStep,'cookingView');
}
function renderCookingStep(){
  if(!cookingRecipe)return;
  const steps=cookingRecipe.steps;
  const totalSteps=steps.length+1; // +1 for mise en place
  const displayStep=cookingStep+1;
  const isMiseEnPlace=cookingStep===0;
  const s=isMiseEnPlace?null:steps[cookingStep-1];

  document.getElementById('ckRecipeName').textContent=cookingRecipe.name;
  document.getElementById('ckCounter').textContent=`${String(displayStep).padStart(2,'0')} / ${String(totalSteps).padStart(2,'0')}`;
  document.getElementById('ckStepNum').innerHTML=isMiseEnPlace?'<span class="ms" style="font-size:48px;color:var(--green)">checklist</span>':'<span style="font-size:48px">'+String(displayStep).padStart(2,'0')+'</span>';
  document.getElementById('ckProgressBar').style.width=(displayStep/totalSteps)*100+'%';

  if(isMiseEnPlace){
    const ingList=cookingRecipe.ingredients.map(ing=>{
      if(ing.section)return`<div style="padding:6px 12px;font-size:var(--fs-0);font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text3)">${esc(ing.section)}</div>`;
      const scaled=scaleAmount(ing.amount,ing.unit,portionScale);
      const amt=fmtIng(scaled,ing.unit);
      const{name}=extractPrepAndName(ing);
      return`<div style="padding:8px 12px;margin:2px 0;background:var(--surface);border-radius:8px;display:flex;align-items:center;gap:8px"><input type="checkbox"> <span>${esc(dispName(name))}: ${esc(amt)}</span></div>`;
    }).join('');
    document.getElementById('ckStepText').innerHTML=`<div style="text-align:left"><strong>Lay it all out first</strong><div style="margin-top:12px;font-size:var(--fs-1)">${ingList}</div></div>`;
  } else {
    document.getElementById('ckStepText').textContent=scaleStepText(s,portionScale);
  }

  const nextStepIdx=cookingStep+1;
  let previewText='';
  if(nextStepIdx<totalSteps){
    previewText=nextStepIdx===0?'Next: Lay out ingredients':'Next: '+steps[nextStepIdx-1].substring(0,50)+'…';
  } else {
    previewText='Recipe complete!';
  }
  document.getElementById('ckPreview').textContent=previewText;
  saveCookingState();

  const timerSecs=isMiseEnPlace?null:parseStepTimer(s);
  const timerRow=document.getElementById('ckTimerRow');
  if(timerSecs&&timerSecs>0){
    stopCookingTimer();
    ckTimerSecs=timerSecs;
    document.getElementById('ckTimerDisplay').textContent=fmtSecs(timerSecs);
    document.getElementById('ckTimerBtnTxt').textContent=`Start ${fmtSecs(timerSecs)} timer`;
    document.getElementById('ckTimerBtn').classList.remove('running');
    timerRow.style.display='flex';
  } else {timerRow.style.display='none';}

  const isLast=cookingStep>=steps.length;
  const nav=document.getElementById('ckNav');
  nav.innerHTML=`<button class="ck-prev"${cookingStep===0?' style="opacity:.4;pointer-events:none"':''} onclick="ckPrevStep()"><span class="ms">arrow_back</span>Prev</button>${isLast?`<button class="ck-done-btn" onclick="finishCooking()"><span class="ms">check_circle</span>Done cooking</button>`:`<button class="ck-next" onclick="ckNextStep()">Next step<span class="ms">arrow_forward</span></button>`}`;
  renderCkIngList();
}
function parseStepTimer(text){
  if(!text)return null;
  if(/overnight|over\s*night/i.test(text))return 8*3600;
  const m=text.match(/(?:for\s+)?(?:about\s+)?(\d+)(?:\s*(?:to|-)\s*\d+)?\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i);
  if(!m)return null;
  const n=parseInt(m[1]),u=m[2].toLowerCase();
  if(u.startsWith('hour')||u.startsWith('hr'))return n*3600;
  if(u.startsWith('min'))return n*60;
  if(u.startsWith('sec'))return n;
  return null;
}
function fmtSecs(s){const m=Math.floor(s/60),r=s%60;return m+':'+(r<10?'0':'')+r;}
function ckNextStep(){haptic(8);if(cookingStep<cookingRecipe.steps.length){cookingStep++;renderCookingStep();}}
function ckPrevStep(){haptic(8);if(cookingStep>0){cookingStep--;renderCookingStep();}}
function finishCooking(){haptic(12);clearCookingState();exitCooking();toast('Great cooking! Recipe complete.');}
function exitCooking(){
  stopCookingTimer();
  document.getElementById('cookingView').classList.add('hidden');
  if(wakeLock){wakeLock.release().catch(()=>{});wakeLock=null;updateWakeLockUI(false);}
  if(currentRecipe){
    // detail view is still rendered underneath — just let it show
  } else {
    document.getElementById('appHdr').style.display='';
    document.getElementById('tabBar').style.display='';
    showTab('home');
  }
  renderContinueBanner();
}
function toggleIngDrawer(){
  document.getElementById('ckIngDrawer').classList.toggle('hidden');
}
function autoGroupIngredients(ings,steps){
  const skip=new Set(['and','or','the','a','an','of','with','fresh','dried','ground','whole','large','small','medium','extra','finely','thinly','roughly','light','dark','coarsely','white','black','red','green','plain','pure','hot','cold']);
  function wordsOf(name){return name.toLowerCase().split(',')[0].split(/\s+/).filter(w=>w.length>2&&!skip.has(w));}
  const flat=ings.filter(i=>!i.section);
  const used=new Set();
  const groups=[];
  for(let si=0;si<steps.length;si++){
    const st=steps[si].toLowerCase();
    const matched=flat.filter((_,idx)=>!used.has(idx)&&wordsOf(flat[idx].name).some(w=>st.includes(w)));
    if(matched.length){matched.forEach(ing=>used.add(flat.indexOf(ing)));groups.push({step:si+1,ings:matched});}
  }
  const remaining=flat.filter((_,idx)=>!used.has(idx));
  if(remaining.length)groups.unshift({step:0,ings:remaining});
  return groups;
}
function renderCkIngList(){
  if(!cookingRecipe)return;
  const groups=autoGroupIngredients(cookingRecipe.ingredients,cookingRecipe.steps||[]);
  document.getElementById('ckServeNote').textContent=`Scaled for ${document.getElementById('portionVal').textContent} serves`;
  document.getElementById('ckIngList').innerHTML=groups.map(g=>{
    const label=g.step===0?'Prep first':`Step ${g.step}`;
    const rows=g.ings.map(ing=>ingRowHtml(ing,portionScale)).join('');
    return`<div class="ing-group"><div class="ing-group-lbl">${label}</div>${rows}</div>`;
  }).join('');
}
function toggleCookingTimer(){
  if(ckTimerRunning)stopCookingTimer();else startCookingTimerRun();
}
function startCookingTimerRun(){
  ckTimerRunning=true;
  const btn=document.getElementById('ckTimerBtn');
  if(btn){btn.classList.add('running');document.getElementById('ckTimerBtnTxt').textContent='Stop timer';}
  ckTimerInterval=setInterval(()=>{
    ckTimerSecs--;
    document.getElementById('ckTimerDisplay').textContent=fmtSecs(Math.max(0,ckTimerSecs));
    if(ckTimerSecs<=0){stopCookingTimer();haptic(100);beep();toast('Time is up!');}
  },1000);
}
function stopCookingTimer(){
  clearInterval(ckTimerInterval);ckTimerRunning=false;
  const btn=document.getElementById('ckTimerBtn');
  if(btn){btn.classList.remove('running');}
}
function beep(){try{const ctx=new(window.AudioContext||window.webkitAudioContext)();[0,.35,.7].forEach(t=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.setValueAtTime(.4,ctx.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+t+.3);o.start(ctx.currentTime+t);o.stop(ctx.currentTime+t+.3);});}catch(e){}}

// ── TABS
function showTab(tab){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  const at=document.getElementById('tab-'+tab);if(at)at.classList.add('active');
  document.querySelectorAll('.view').forEach(v=>{v.style.display='none';v.classList.remove('active')});
  const v=document.getElementById('view-'+tab);if(v){v.style.display='block';v.classList.add('active');}
  currentTab=tab;
  document.getElementById('appHdr').style.display='';
  document.getElementById('tabBar').style.display='';
  if(tab==='home')renderHome();
  if(tab==='saved')guarded(renderSaved,'savedList');
  if(tab==='shoplist'){setShopSort(shopSort);updateShopBadge();}
  if(tab==='ratios')guarded(renderRatios,'ratiosList');
}
function switchTab(tab){
  haptic(8);
  if(currentTab==='detail')currentRecipe=null;
  showTab(tab);
}

// ── SHOPPING TAB
function saveGlobalShopList(){store.set(K.list,globalShopList);}
function updateShopBadge(){
  const n=globalShopList.filter(i=>!i.checked).length;
  const b=document.getElementById('shopBadge');if(b){b.textContent=n||'';b.classList.toggle('show',n>0);}
  const sub=document.getElementById('shopSubtitle');if(sub)sub.textContent=n?`${n} item${n===1?'':'s'} to get`:'Items to pick up';
}
function setShopSort(mode){
  shopSort=mode;
  document.getElementById('sortAisleBtn').classList.toggle('active',mode==='aisle');
  document.getElementById('sortRecipeBtn').classList.toggle('active',mode==='recipe');
  guarded(renderShoppingTab,'shopContent');
}
function renderShoppingTab(){
  const empty=document.getElementById('shopEmpty');const content=document.getElementById('shopContent');
  updateShopBadge();
  if(!globalShopList.length){empty.style.display='flex';content.innerHTML='';return;}
  empty.style.display='none';
  const itemRow=item=>`<div class="shop-row${item.checked?' done':''}" onclick="toggleShopTab(${item.idx})">
    <div class="shop-chk"><svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
    <div style="flex:1"><div class="shop-iname">${esc(dispName(item.name))}</div>${shopSort==='aisle'&&item.recipe?`<div class="shop-sub">${esc(item.recipe)}</div>`:''}</div>
    <span class="shop-amt">${esc(item.amount)}</span>
  </div>`;
  let groups={};
  globalShopList.forEach((item,i)=>{
    const key=shopSort==='aisle'?(item.aisle||getAisle(item.name)):item.recipe;
    if(!groups[key])groups[key]=[];groups[key].push({...item,idx:i});
  });
  const order=shopSort==='aisle'?AISLES.map(a=>a.name).concat([AISLE_OTHER]):Object.keys(groups);
  content.innerHTML=(shopSort==='aisle'?order.filter(k=>groups[k]):order).map(grp=>`
    <div class="shop-section">
      <div class="shop-sec-hdr"><span class="ms">${shopSort==='aisle'?aisleIcon(grp):'receipt_long'}</span><span class="shop-sec-name">${esc(grp)}</span><span class="shop-sec-count">${(groups[grp]||[]).filter(i=>!i.checked).length} to get</span></div>
      ${(groups[grp]||[]).map(item=>itemRow(item)).join('')}
    </div>`).join('');
}
function toggleShopTab(idx){haptic(8);globalShopList[idx].checked=!globalShopList[idx].checked;saveGlobalShopList();renderShoppingTab();}
function clearShoppingTab(){if(!confirm('Clear entire shopping list? This cannot be undone.'))return;haptic(12);globalShopList=[];saveGlobalShopList();renderShoppingTab();toast('Shopping list cleared');}
function copyShoppingTab(){
  haptic(12);if(!globalShopList.length){toast('List is empty');return;}
  const lines=globalShopList.filter(i=>!i.checked).map(i=>`- ${i.name}: ${i.amount}`);
  navigator.clipboard.writeText(lines.length?lines.join('\n'):'All items ticked!').then(()=>toast('Shopping list copied'));
}

// ── SHARE
function shareRecipe(){
  haptic(8);const r=currentRecipe;
  const url=`${location.origin}${location.pathname}#recipe-${r.id}`;
  if(navigator.share)navigator.share({title:r.name,text:`${r.name} — ${r.time} | ${cap(r.difficulty)}`,url}).catch(()=>{});
  else navigator.clipboard.writeText(url).then(()=>toast('Link copied!'));
}

// ── RATIOS
let savedRatios=store.get(K.ratios,[]);
let ratioViewMode={},ratioScale={},ratioOpen={},activeRatioFolder=null;
const SCALE_STEPS=[0.5,1,1.5,2,3,4];

// Folders group the data file's granular `type` field into home-screen-style
// tiles. Reuses the existing --cat-* colour tokens so no new CSS vars are needed.
const RATIO_FOLDERS=[
  {key:'brines',label:'Brines',icon:'water_drop',cat:'--cat-seafood',types:['BRINE']},
  {key:'stocks',label:'Stocks & Bases',icon:'soup_kitchen',cat:'--cat-soups',types:['STOCK','BASE','SAUCE BASE','CONVERSION']},
  {key:'sauces',label:'Sauces',icon:'blender',cat:'--cat-sauces',types:['SAUCE','EMULSION']},
  {key:'dressings',label:'Dressings',icon:'colorize',cat:'--cat-salads',types:['DRESSING']},
  {key:'dough',label:'Dough & Pastry',icon:'bakery_dining',cat:'--cat-bread',types:['DOUGH','PASTRY','BATTER']},
  {key:'sweet',label:'Sweet & Baking',icon:'cake',cat:'--cat-desserts',types:['SWEET','CUSTARD','CAKE','BISCUIT']},
  {key:'grains',label:'Grains',icon:'rice_bowl',cat:'--cat-pasta',types:['GRAIN']},
  {key:'technique',label:'Techniques',icon:'outdoor_grill',cat:'--cat-meat',types:['METHOD','BREW']},
];
function renderRatios(){
  const inFolder=!!activeRatioFolder;
  document.getElementById('ratiosHomeHdr').style.display=inFolder?'none':'';
  document.getElementById('ratioFolderGrid').style.display=inFolder?'none':'grid';
  document.getElementById('ratioFolderHero').style.display=inFolder?'':'none';
  if(inFolder)renderRatioFolderView();else renderRatioFolderGrid();
}
function renderRatioFolderGrid(){
  document.getElementById('ratioFolderGrid').innerHTML=RATIO_FOLDERS.map(f=>{
    const n=RATIOS.filter(r=>f.types.includes(r.type)).length;
    if(!n)return'';
    return`<div class="cat-card" style="--cat:var(${f.cat})" onclick="openRatioFolder('${jsArg(f.key)}')" role="button" tabindex="0">
      <span class="ms">${f.icon}</span>
      <div class="cat-card-name">${esc(f.label)}</div>
      <div class="cat-card-count">${n} ratio${n===1?'':'s'}</div>
    </div>`;
  }).join('');
}
function openRatioFolder(key){haptic(6);activeRatioFolder=key;renderRatios();document.getElementById('main').scrollTop=0;}
function closeRatioFolder(){haptic(6);activeRatioFolder=null;renderRatios();}
function renderRatioFolderView(){
  const folder=RATIO_FOLDERS.find(f=>f.key===activeRatioFolder);if(!folder)return;
  const list=RATIOS.filter(r=>folder.types.includes(r.type));
  const hero=document.getElementById('ratioFolderHero');
  hero.style.cssText=`--cat:var(${folder.cat})`;
  hero.innerHTML=`
    <div class="cat-hero-top">
      <button class="back-pill" onclick="closeRatioFolder()"><span class="ms">arrow_back</span>Ratios</button>
    </div>
    <span class="ms cat-hero-icon">${folder.icon}</span>
    <h2>${esc(folder.label)}</h2>
    <div class="cnt">${list.length} ratio${list.length===1?'':'s'}</div>`;
  document.getElementById('ratiosList').innerHTML=list.map(r=>ratioCardHtml(r)).join('');
}
function toggleRatioOpen(id){haptic(6);ratioOpen[id]=!ratioOpen[id];reRenderRatioCard(id);}
function ratioCardHtml(r){
  const id=r.id;
  const isSaved=savedRatios.includes(id);
  const mode=ratioViewMode[id]||'parts';
  const scale=ratioScale[id]||1;
  const isMetric=mode==='metric';
  const pSize=r.formula.length<=2?56:r.formula.length<=4?46:36;
  const formulaHtml=r.formula.map((f,i)=>{
    const sep=i>0?'<span class="rc-sep">:</span>':'';
    let val;
    if(!isMetric){
      const num=f.partsLabel||(f.parts===Math.floor(f.parts)?f.parts:f.parts.toFixed(1));
      val=`<span class="rc-pnum" style="font-size:${pSize}px">${esc(num)}</span>`;
    } else {
      const raw=f.metricVal*scale;
      if(f.metricUnit==='whole'){
        val=`<span class="rc-mnum">${Math.max(1,Math.round(raw))}</span><span class="rc-munit"> ea</span>`;
      } else {
        const rounded=raw>=100?Math.round(raw/5)*5:raw>=10?Math.round(raw):Math.round(raw*2)/2;
        val=`<span class="rc-mnum">${rounded}</span><span class="rc-munit">${esc(f.metricUnit)}</span>`;
      }
    }
    return `${sep}<div class="rc-fi">${val}<span class="rc-flabel">${esc(f.label)}</span></div>`;
  }).join('');
  const scaleDisplay=scale%1===0?scale+'×':scale.toFixed(1)+'×';
  const scaleHtml=isMetric?`
    <div class="rc-scale">
      <span class="rc-scale-lbl">Scale</span>
      <button class="rc-sbtn" onclick="stepRatioScale('${jsArg(id)}',-1)">−</button>
      <span class="rc-scale-val">${scaleDisplay}</span>
      <button class="rc-sbtn" onclick="stepRatioScale('${jsArg(id)}',1)">+</button>
    </div>`:'';
  const swapsHtml=r.swaps?`<div class="rc-swaps"><span class="ms">swap_horiz</span>${esc(r.swaps)}</div>`:'';
  const open=!!ratioOpen[id];
  const bodyHtml=open?`<div class="rc-body">
    <div class="rc-formula">${formulaHtml}</div>
    <div class="rc-controls">
      <div class="rc-toggle">
        <button class="rc-vbtn${!isMetric?' on':''}" onclick="setRatioView('${jsArg(id)}','parts')">Parts</button>
        <button class="rc-vbtn${isMetric?' on':''}" onclick="setRatioView('${jsArg(id)}','metric')">Metric</button>
      </div>
      ${scaleHtml}
    </div>
    ${r.technique?`<div class="rc-technique">${esc(r.technique)}</div>`:''}
    ${swapsHtml}
  </div>`:'';
  return `<div class="ratio-card${open?' open':''}" id="rcard-${esc(id)}">
    <div class="rc-collapse" onclick="toggleRatioOpen('${jsArg(id)}')" role="button" tabindex="0" aria-expanded="${open}">
      <div class="rc-collapse-main">
        <h3 class="rc-name">${esc(r.name)}</h3>
        <span class="rc-type">${esc(r.type)}</span>
      </div>
      <button class="rc-save${isSaved?' saved':''}" onclick="event.stopPropagation();toggleRatioSave('${jsArg(id)}')" aria-label="Save ratio"><span class="ms">${isSaved?'bookmark':'bookmark_border'}</span></button>
      <span class="ms rc-chev">expand_more</span>
    </div>
    ${bodyHtml}
  </div>`;
}
function reRenderRatioCard(id){
  const r=RATIOS.find(x=>x.id===id);
  const el=document.getElementById('rcard-'+id);
  if(!el||!r)return;
  const tmp=document.createElement('div');
  tmp.innerHTML=ratioCardHtml(r);
  el.replaceWith(tmp.firstElementChild);
}
function setRatioView(id,mode){haptic(8);ratioViewMode[id]=mode;reRenderRatioCard(id);}
function stepRatioScale(id,dir){
  haptic(8);
  const cur=ratioScale[id]||1;
  const idx=SCALE_STEPS.indexOf(cur);
  const next=Math.max(0,Math.min(SCALE_STEPS.length-1,idx+dir));
  ratioScale[id]=SCALE_STEPS[next];
  reRenderRatioCard(id);
}
function toggleRatioSave(id){
  haptic(12);
  const i=savedRatios.indexOf(id);
  if(i>=0)savedRatios.splice(i,1);else savedRatios.push(id);
  store.set(K.ratios,savedRatios);
  reRenderRatioCard(id);
  toast(savedRatios.includes(id)?'Ratio saved':'Removed from saved');
}

// ── WAKE LOCK
function updateWakeLockUI(isOn){
  const hBtn=document.getElementById('wakeBtn');
  const ckBtn=document.getElementById('ckWakeBtn');
  const pill=document.getElementById('ckWakePill');
  const lbl=document.getElementById('ckWakeLabel');
  if(hBtn)hBtn.classList.toggle('on',isOn);
  if(ckBtn)ckBtn.classList.toggle('off',!isOn);
  if(pill)pill.textContent=isOn?'ON':'OFF';
  if(lbl)lbl.textContent=isOn?'Screen staying on':'Screen can sleep — tap to lock';
}
async function toggleWakeLock(){
  haptic(8);
  if(wakeLock){
    await wakeLock.release();wakeLock=null;
    updateWakeLockUI(false);toast('Screen sleep restored');
  } else {
    try{
      wakeLock=await navigator.wakeLock.request('screen');
      updateWakeLockUI(true);toast('Screen will stay on');
      wakeLock.addEventListener('release',()=>{wakeLock=null;updateWakeLockUI(false);});
    }catch(e){toast('Wake lock not available on this device');}
  }
}
document.addEventListener('visibilitychange',async()=>{
  if(document.getElementById('wakeBtn').classList.contains('on')&&document.visibilityState==='visible'){
    try{wakeLock=await navigator.wakeLock.request('screen');updateWakeLockUI(true);}catch(e){}
  }
});

// ── HELPERS
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function dispName(name){
  const n=name.toLowerCase();
  if(n.includes('stock')||n.includes('broth'))return'Stock (Chicken or Vege)';
  return name;
}
function fracStr(n){const w=Math.floor(n),f=n-w;const fr=[[.125,'⅛'],[.25,'¼'],[.33,'⅓'],[.5,'½'],[.67,'⅔'],[.75,'¾']];const m=fr.find(([v])=>Math.abs(f-v)<.07);if(!m)return parseFloat(n.toFixed(1)).toString();return w?`${w}${m[1]}`:m[1];}
// snap scaled spoon measures to friendly fractions; tiny amounts become "pinch"
function fmtSpoon(n,unit){
  if(unit==='tbsp'){
    const s=Math.round(n*2)/2;
    if(s<0.5)return fmtSpoon(n*4,'tsp');
    return`${fracStr(s)} tbsp (${Math.round(s*20)}ml)`;
  }
  const s=Math.round(n*8)/8;
  if(s<0.125)return'pinch';
  return`${fracStr(s)} tsp${s>=1?` (${Math.round(s*5)}ml)`:''}`;
}
function pluralUnit(n,unit){
  const u=(unit||'').toLowerCase().trim();
  if(Math.round(n*4)/4===1){const sg={'cloves':'clove','cups':'cup','fillets':'fillet','rashers':'rasher','sheets':'sheet','leaves':'leaf','sprigs':'sprig'};return sg[u]||u;}
  else{const pl={'clove':'cloves','cup':'cups','fillet':'fillets','rasher':'rashers','sheet':'sheets','leaf':'leaves','sprig':'sprigs'};return pl[u]||u;}
}
function roundShoppable(n,u){
  if(u==='g'){if(n<20)return n;if(n<100)return Math.round(n/5)*5;return Math.round(n/25)*25;}
  if(u==='ml'){if(n<20)return n;return Math.round(n/25)*25;}
  return n;
}
function fmtIng(amount,unit){
  if(!amount||isNaN(amount))return'';
  const u=(unit||'').toLowerCase().trim();
  let n=amount;
  const desc=['to taste','to serve','handful','pinch','bunch','bunches','sprig','sprigs'];
  if(desc.some(d=>u.includes(d)))return unit;
  if(u==='g'){n=roundShoppable(n,'g');return Math.round(n)+'g';}
  if(u==='kg')return parseFloat(n.toFixed(2))+'kg';
  if(u==='ml'){
    n=roundShoppable(n,'ml');
    if(n<=120){
      const tbsp=n/20,tbspR=Math.round(tbsp*2)/2;
      if(Math.abs(tbspR-tbsp)<.09&&tbspR>=1)return`${fracStr(tbspR)} tbsp (${Math.round(tbspR*20)}ml)`;
      const tsp=n/5,tspR=Math.round(tsp*4)/4;
      if(Math.abs(tspR-tsp)<.09&&tspR>=.25)return`${fracStr(tspR)} tsp (${Math.round(tspR*5)}ml)`;
    }
    return Math.round(n)+'ml';
  }
  if(u==='tbsp'||u==='tsp')return fmtSpoon(n,u);
  const cnt=['whole','clove','cloves','yolk','yolks','rasher','rashers','fillet','fillets','stalk','stalks','piece','pieces','slice','slices','leaf','leaves','lemon','lime','orange','punnet','sheet','sheets','head','cup','cups','loaf','small','medium','large'];
  if(cnt.some(c=>u.includes(c))){const pu=pluralUnit(n,u);return(n%1===0?n.toString():fracStr(n))+' '+pu;}
  return(n>=10?Math.round(n).toString():parseFloat(n.toFixed(1)).toString())+(unit?' '+unit:'');
}
function toast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2800);
}

// ── SERVICE WORKER with self-applying updates.
// sw.js uses skipWaiting + clients.claim, so a deployed version bump takes
// over immediately; we then reload once so every phone runs the latest
// version without anyone having to clear caches or reinstall.
if('serviceWorker'in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('/sw.js').then(reg=>{
      // re-check for a new deploy whenever the app returns to the foreground
      document.addEventListener('visibilitychange',()=>{
        if(document.visibilityState==='visible')reg.update().catch(()=>{});
      });
    }).catch(()=>{});
    let hadController=!!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(!hadController){hadController=true;return;} // first install: page is already fresh
      // don't yank the screen away mid-cook — apply on next launch instead
      const cooking=!document.getElementById('cookingView').classList.contains('hidden');
      if(cooking){toast('Update ready — it will apply next time you open the app');return;}
      location.reload();
    });
  });
}

// ── MANUAL REFRESH (home-screen card)
// iPhone home-screen apps never refresh on their own; this checks the server
// for a new deploy. If one exists the controllerchange handler above reloads;
// otherwise we reload anyway so the user always lands on the freshest build.
let _refreshing=false;
async function refreshApp(){
  if(_refreshing)return;
  _refreshing=true;
  haptic(8);
  const icon=document.getElementById('refreshIcon');
  if(icon)icon.classList.add('spin');
  toast('Checking for new recipes…');
  try{
    const reg=await(navigator.serviceWorker&&navigator.serviceWorker.getRegistration());
    if(reg){
      await reg.update();
      if(reg.installing||reg.waiting){toast('New recipes found — updating…');return;}
    }
  }catch(e){}
  setTimeout(()=>location.reload(),700);
}

// ── PROFILE (one input, one key, skippable)
function maybeAskName(){
  if(prefs.name||prefs.askedName)return;
  document.getElementById('nameSheet').classList.remove('hidden');
}
function submitName(){
  const v=document.getElementById('nameInput').value.trim();
  prefs.askedName=true;
  if(v)prefs.name=v.slice(0,30);
  store.set(K.prefs,prefs);
  document.getElementById('nameSheet').classList.add('hidden');
  if(v)toast(`G'day ${prefs.name}!`);
}
function skipName(){
  prefs.askedName=true;store.set(K.prefs,prefs);
  document.getElementById('nameSheet').classList.add('hidden');
}

// ── BACKUP & RESTORE (clipboard JSON, entirely local)
function exportBackup(){
  haptic(8);
  const payload={app:'cooking-with-will',version:APP_VERSION,exported:new Date().toISOString(),
    saved,notes,prefs,recent:recentIds,list:globalShopList,ratios:savedRatios};
  const json=JSON.stringify(payload);
  const done=()=>toast('Backup copied — paste it somewhere safe');
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(json).then(done).catch(()=>showBackupText(json));
  }else showBackupText(json);
}
function showBackupText(json){
  const sheet=document.getElementById('restoreSheet');
  sheet.classList.remove('hidden');
  document.getElementById('restoreTitle').textContent='Your backup';
  document.getElementById('restoreSub').textContent='Copy this text and keep it somewhere safe.';
  document.getElementById('restoreBox').value=json;
  document.getElementById('restoreConfirm').style.display='none';
}
function openRestore(){
  haptic(8);
  const sheet=document.getElementById('restoreSheet');
  sheet.classList.remove('hidden');
  document.getElementById('restoreTitle').textContent='Restore a backup';
  document.getElementById('restoreSub').textContent='Paste the backup text you copied earlier, then tap Restore.';
  document.getElementById('restoreBox').value='';
  document.getElementById('restoreConfirm').style.display='';
}
function closeRestore(){document.getElementById('restoreSheet').classList.add('hidden');}
function confirmRestore(){
  let data=null;
  try{data=JSON.parse(document.getElementById('restoreBox').value.trim());}catch(e){}
  if(!data||data.app!=='cooking-with-will'){toast('That does not look like a backup');return;}
  if(Array.isArray(data.saved)){
    // old backups may reference deduped recipe ids — remap and de-dupe
    const seen=new Set();
    saved=data.saved.filter(e=>e&&typeof e.id==='number')
      .map(e=>({...e,id:mapId(e.id)}))
      .filter(e=>!seen.has(e.id)&&seen.add(e.id));
  }
  if(data.notes&&typeof data.notes==='object')notes=data.notes;
  if(data.prefs&&typeof data.prefs==='object')prefs=data.prefs;
  if(Array.isArray(data.recent))recentIds=data.recent.filter(x=>typeof x==='number').slice(0,5);
  if(Array.isArray(data.list))globalShopList=data.list;
  if(Array.isArray(data.ratios))savedRatios=data.ratios;
  saveSaved();store.set(K.notes,notes);store.set(K.prefs,prefs);store.set(K.recent,recentIds);
  saveGlobalShopList();store.set(K.ratios,savedRatios);
  updateSavedBadge();updateShopBadge();closeRestore();
  if(currentTab==='saved')renderSaved();
  renderHomeMode();
  toast('Backup restored');
}

// ── REQUEST A RECIPE (mailto: — no backend, no email service)
const AUTHOR_EMAIL='iamgoodwill@icloud.com';
function openRequestSheet(prefillDish){
  haptic(8);
  document.getElementById('requestSheet').classList.remove('hidden');
  document.getElementById('reqDish').value=prefillDish||'';
  document.getElementById('reqName').value=prefs.name||'';
  document.getElementById('reqFallback').style.display='none';
}
function closeRequestSheet(){document.getElementById('requestSheet').classList.add('hidden');}
function sendRequest(){
  const dish=document.getElementById('reqDish').value.trim();
  if(!dish){toast('What dish should Will cook?');document.getElementById('reqDish').focus();return;}
  const note=document.getElementById('reqNote').value.trim();
  const who=document.getElementById('reqName').value.trim();
  const subject=`Recipe request: ${dish}`;
  const body=[note,who?`— ${who}`:'',`(sent from Cooking With Will v${APP_VERSION})`].filter(Boolean).join('\n\n');
  const href=`mailto:${AUTHOR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  gtag('event','request_recipe',{dish});
  window.location.href=href;
  // if no mail handler picks it up, offer the address to copy
  setTimeout(()=>{
    if(document.visibilityState==='visible'){
      document.getElementById('reqFallback').style.display='';
    }else closeRequestSheet();
  },1200);
}
function copyAuthorEmail(){
  navigator.clipboard.writeText(AUTHOR_EMAIL).then(()=>toast('Email address copied'));
}

// ── INIT
validateAllRecipes();
updateShopBadge();
updateSavedBadge();
renderHome();
maybeAskName();
// Deep link: auto-open recipe from URL hash e.g. #recipe-42
(function(){const h=location.hash;if(!h.startsWith('#recipe-'))return;const raw=parseInt(h.slice(8));const id=DUPLICATE_ID_MAP[raw]||raw;if(!isNaN(id)&&ALL_RECIPES.find(x=>x.id===id))openRecipe(id);})();

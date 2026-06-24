# Recipe File Format Standards

This document defines the format and standards for recipe files in this project.

## File Structure

Recipe data is split across multiple files:
- `recipes.js` - RECIPES (recipes 1-~85)
- `recipes2.js` - RECIPES2 (recipes ~86-~170)
- `recipes3.js` - RECIPES3 (recipes ~171-~249)
- `recipes4.js` - RECIPES4 (recipes ~250-~275, currently disabled)

## Required Format

### File Header
```javascript
const RECIPES = [
```

### File Footer
```javascript
];
```

## Recipe Object Structure

Each recipe must have this structure:

```javascript
{
  id: 1,
  name: 'Recipe Name',
  category: 'Category Name',
  difficulty: 'easy' | 'medium' | 'hard',
  serves: 4,
  time: '30 min',
  calories: 250,
  mainIngredient: 'Primary Ingredient',
  ingredients: [
    { name: 'Ingredient 1', amount: 100, unit: 'g' },
    { name: 'Ingredient 2', prep: 'chopped', amount: 2, unit: 'whole' },
    // Optional: section headers
    { section: 'SAUCE SECTION' }
  ],
  steps: [
    'Step 1 description',
    'Step 2 description',
    // ... more steps
  ]
}
```

## Formatting Rules

### ✅ MUST DO
- **Keep files formatted** with proper line breaks and indentation
- **Use 2-space indentation** for nested objects/arrays
- **One recipe per section** with blank lines between recipes
- **Separate array items** with commas on the same line
- **Validate syntax** before committing (pre-commit hook will check)

### ❌ NEVER DO
- **Do NOT minify** recipe files - keep them readable
- **Do NOT merge** multiple recipes on one line
- **Do NOT create** duplicate recipe IDs
- **Do NOT commit** files with syntax errors
- **Do NOT use** trailing commas in array (some browsers don't support)

## Valid Categories

```
Dips & Starters
Salads
Soups
Seafood
Meat & Poultry
Vegetarian
Pasta & Rice
Sides
Bread & Bakes
Sauces & Condiments
Desserts
Cocktails
Poultry
```

## Recipe ID Rules

- **IDs must be unique** across all recipe files
- **IDs should be sequential** (1, 2, 3, ...)
- **If renumbering** (e.g., merging duplicate IDs), update ALL references

## Validation

Before committing recipe changes:

1. **Syntax Check**: `node -c recipes.js`
2. **Load Test**: `node test-recipes.js`
3. **ID Check**: Ensure no duplicates across all files
4. **Format Check**: Verify proper spacing and indentation

The pre-commit hook will automatically validate syntax before accepting commits.

## Example Recipe

```javascript
{id:1,name:'Avocado Tzatziki',category:'Dips & Starters',difficulty:'easy',serves:3,time:'15 min',calories:180,mainIngredient:'Avocado',
ingredients:[
  {name:'Avocados',amount:2,unit:'whole'},
  {name:'Greek yoghurt',amount:260,unit:'g'},
  {name:'Cucumber',prep:'grated and squeezed dry',amount:1,unit:'whole'},
  {name:'Garlic clove',prep:'crushed',amount:1,unit:'clove'},
  {name:'White wine vinegar',amount:30,unit:'ml'},
  {name:'Fresh mint',prep:'chopped',amount:1,unit:'handful'},
  {name:'Olive oil',amount:15,unit:'ml'},
  {name:'Salt and black pepper',amount:1,unit:'to taste'},
],
steps:[
  'Mash avocados in a bowl until smooth.',
  'Mix in yoghurt, grated cucumber, garlic, vinegar and chopped mint.',
  'Season well with salt and black pepper.',
  'Transfer to a serving bowl and drizzle with olive oil.',
  'Top with radish slices, dill and fresh mint. Serve chilled.',
]},
```

## Merging & Conflicts

When merging recipe changes:
1. **Resolve conflicts carefully** - don't accidentally create duplicates
2. **Verify syntax** after resolving: `node -c recipes.js`
3. **Run tests**: `node test-recipes.js`
4. **Check IDs** for uniqueness across all files

## Adding New Recipes

1. Choose the appropriate file (recipes.js, recipes2.js, etc.)
2. Use the next available ID
3. Ensure proper formatting with spacing
4. Add to the appropriate category
5. Test syntax before committing
6. Pre-commit hook will validate automatically

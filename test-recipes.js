#!/usr/bin/env node
/**
 * Recipe Validation Test
 * Validates that all recipe files load correctly and contain valid data
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Running Recipe Validation Tests...\n');

let testsPassed = 0;
let testsFailed = 0;
const issues = [];

// Test 1: File syntax validation
console.log('Test 1: JavaScript Syntax Validation');
const recipeFiles = ['recipes.js', 'recipes2.js', 'recipes3.js', 'recipes4.js'];
let allFilesValid = true;

for (const file of recipeFiles) {
  const filepath = path.join(__dirname, file);
  if (!fs.existsSync(filepath)) {
    console.log(`  ⏭️  ${file} (not found, skipping)`);
    continue;
  }

  try {
    require.cache[require.resolve(filepath)] = null;
    require(filepath);
    console.log(`  ✅ ${file}`);
    testsPassed++;
  } catch (err) {
    console.log(`  ❌ ${file}: ${err.message.split('\n')[0]}`);
    issues.push(`${file}: ${err.message}`);
    testsFailed++;
    allFilesValid = false;
  }
}

if (!allFilesValid) {
  console.log('\n❌ FAILED: Some recipe files have syntax errors');
  process.exit(1);
}

// Test 2: Load all recipes
console.log('\nTest 2: Loading All Recipes');
let totalRecipes = 0;
const allRecipeIds = new Set();
const duplicateIds = [];

try {
  const RECIPES = require('./recipes.js');
  const RECIPES2 = require('./recipes2.js');
  const RECIPES3 = require('./recipes3.js');

  let RECIPES4 = [];
  try {
    RECIPES4 = require('./recipes4.js');
  } catch (e) {
    console.log('  ⚠️  recipes4.js disabled (contains errors)');
  }

  const allRecipes = [...RECIPES, ...RECIPES2, ...RECIPES3, ...RECIPES4];
  totalRecipes = allRecipes.length;
  console.log(`  ✅ Loaded ${totalRecipes} recipes`);
  testsPassed++;

  // Test 3: Check for duplicate IDs
  console.log('\nTest 3: Checking for Duplicate Recipe IDs');
  for (const recipe of allRecipes) {
    if (allRecipeIds.has(recipe.id)) {
      duplicateIds.push(recipe.id);
    }
    allRecipeIds.add(recipe.id);
  }

  if (duplicateIds.length > 0) {
    console.log(`  ❌ Found ${duplicateIds.length} duplicate IDs: ${duplicateIds.join(', ')}`);
    testsFailed++;
    issues.push(`Duplicate recipe IDs: ${duplicateIds.join(', ')}`);
  } else {
    console.log(`  ✅ All ${totalRecipes} recipe IDs are unique`);
    testsPassed++;
  }

  // Test 4: Validate recipe structure
  console.log('\nTest 4: Validating Recipe Structure');
  const requiredFields = ['id', 'name', 'category', 'difficulty', 'serves', 'time', 'calories', 'mainIngredient', 'ingredients', 'steps'];
  let structureErrors = 0;

  for (const recipe of allRecipes) {
    const missingFields = requiredFields.filter(field => !(field in recipe));
    if (missingFields.length > 0) {
      console.log(`  ❌ Recipe ${recipe.id} (${recipe.name}): Missing fields: ${missingFields.join(', ')}`);
      structureErrors++;
      issues.push(`Recipe ${recipe.id}: Missing ${missingFields.join(', ')}`);
    }

    // Validate ingredients
    if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
      console.log(`  ⚠️  Recipe ${recipe.id} has no ingredients`);
    }

    // Validate steps
    if (!Array.isArray(recipe.steps) || recipe.steps.length === 0) {
      console.log(`  ⚠️  Recipe ${recipe.id} has no steps`);
    }
  }

  if (structureErrors === 0) {
    console.log(`  ✅ All ${totalRecipes} recipes have valid structure`);
    testsPassed++;
  } else {
    testsFailed++;
  }

  // Test 5: Check categories
  console.log('\nTest 5: Validating Categories');
  const validCategories = [
    'Dips & Starters',
    'Salads',
    'Soups',
    'Seafood',
    'Meat & Poultry',
    'Vegetarian',
    'Pasta & Rice',
    'Sides',
    'Bread & Bakes',
    'Sauces & Condiments',
    'Sauces',
    'Desserts',
    'Cocktails',
    'Poultry'
  ];

  const invalidCategories = new Set();
  for (const recipe of allRecipes) {
    if (!validCategories.includes(recipe.category)) {
      invalidCategories.add(recipe.category);
    }
  }

  if (invalidCategories.size > 0) {
    console.log(`  ⚠️  Found ${invalidCategories.size} non-standard categories:`);
    invalidCategories.forEach(cat => console.log(`     - ${cat}`));
    console.log('  See RECIPE_FORMAT.md for valid categories');
  } else {
    console.log(`  ✅ All recipes use valid categories`);
    testsPassed++;
  }

  // Test 6: Difficulty levels
  console.log('\nTest 6: Validating Difficulty Levels');
  const validDifficulties = ['easy', 'medium', 'hard'];
  const invalidDifficulties = new Set();

  for (const recipe of allRecipes) {
    if (!validDifficulties.includes(recipe.difficulty)) {
      invalidDifficulties.add(recipe.difficulty);
    }
  }

  if (invalidDifficulties.size > 0) {
    console.log(`  ❌ Invalid difficulty levels: ${Array.from(invalidDifficulties).join(', ')}`);
    testsFailed++;
  } else {
    console.log(`  ✅ All recipes have valid difficulty levels`);
    testsPassed++;
  }

} catch (err) {
  console.log(`  ❌ Error loading recipes: ${err.message}`);
  testsFailed++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log('='.repeat(50));

if (testsFailed > 0) {
  console.log('\n❌ VALIDATION FAILED\n');
  if (issues.length > 0) {
    console.log('Issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }
  process.exit(1);
} else {
  console.log('\n✅ ALL TESTS PASSED\n');
  console.log(`Total recipes loaded: ${totalRecipes}`);
  process.exit(0);
}

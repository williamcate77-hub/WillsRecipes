# Contributing to Will's Recipes

Thanks for contributing! Please follow these guidelines to ensure code quality and prevent issues.

## Setup

### 1. Install Dependencies
```bash
# Install Node.js (if not already installed)
# macOS: brew install node
# Ubuntu: sudo apt-get install nodejs
# Windows: Download from nodejs.org
```

### 2. Setup Git Hooks
```bash
# Make the pre-commit hook executable
chmod +x .git/hooks/pre-commit

# Test the hook
.git/hooks/pre-commit
```

### 3. Configure Git Settings
```bash
# Prevent line-ending issues
git config core.safecrlf true

# Global setting (optional)
git config --global core.safecrlf true
```

## Before Committing

### 1. Validate Recipe Files
```bash
# Run the test suite
npm run validate

# OR check individual files
node -c recipes.js
```

### 2. Check Formatting
- Keep recipe files **properly formatted** with indentation
- **Never minify** recipe files
- Use **2-space indentation**
- Add **blank lines** between recipes

### 3. Verify Structure
All recipes must have:
- ✅ Unique ID
- ✅ Name, category, difficulty
- ✅ Serves, time, caloriesPerServe, mainIngredient
- ✅ Ingredients array (non-empty)
- ✅ Steps array (non-empty)

## Adding New Recipes

1. Choose the appropriate file based on current recipe count:
   - `recipes.js`: Recipes 1-85

2. Use the next available ID number

3. Follow the recipe format from `RECIPE_FORMAT.md`

4. Ensure proper spacing and indentation

5. Run tests before committing:
   ```bash
   npm run validate
   ```

## Merging Changes

When merging recipe changes (especially from conflicting branches):

1. **Resolve conflicts manually** - don't let git auto-merge
2. **Verify no duplicate IDs** across all files
3. **Check formatting** isn't minified
4. **Run full validation**:
   ```bash
   npm run validate
   ```

## Recipe Format

See `RECIPE_FORMAT.md` for:
- Full recipe structure
- Valid categories and difficulty levels
- Formatting rules
- Examples

## Pre-Commit Hook

The pre-commit hook automatically checks:
- ✅ JavaScript syntax validity
- ✅ File isn't minified (has enough lines)
- ✅ Files load without errors

If the hook fails:
1. Fix the issues it reports
2. Run validation tests
3. Try committing again

To bypass the hook (not recommended):
```bash
git commit --no-verify
```

## CI/CD Pipeline

GitHub Actions automatically validates:
- Recipe syntax on every push and PR
- Proper formatting
- No minification
- Valid structure

All tests must pass before merging.

## Common Issues

### "Unexpected token '{'"
- Usually means minified code or syntax error
- Run: `node -c recipes.js` to find the exact line
- Check formatting against RECIPE_FORMAT.md

### "Duplicate ID"
- Recipe IDs must be unique across all files
- Check all recipe files for conflicts
- Update ID and all references

### "Missing required fields"
- Recipe is missing one of: id, name, category, difficulty, serves, time, caloriesPerServe, mainIngredient, ingredients, steps
- See RECIPE_FORMAT.md for complete structure

### Pre-commit hook not working
- Verify hook is executable: `ls -l .git/hooks/pre-commit`
- Make executable: `chmod +x .git/hooks/pre-commit`
- Verify Node.js is installed: `node --version`

## Questions?

Refer to:
- `RECIPE_FORMAT.md` - Recipe structure and standards
- `scripts/validate.js` - What validation tests check
- `.git/hooks/pre-commit` - What the pre-commit hook validates
- `.github/workflows/validate-recipes.yml` - CI/CD checks

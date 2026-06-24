# Quick Start - Developer Setup

## First Time Setup (5 minutes)

```bash
# 1. Make scripts executable
chmod +x .git/hooks/pre-commit
chmod +x setup-dev.sh

# 2. Run setup
./setup-dev.sh

# 3. You're ready!
```

## Before Every Commit

```bash
# Validate recipes
node test-recipes.js

# If all tests pass, commit normally
git commit -m "Add new recipe"
# Pre-commit hook runs automatically
```

## Adding a New Recipe

1. Open the appropriate recipe file:
   - `recipes.js` → recipes 1-85
   - `recipes2.js` → recipes 86-170
   - `recipes3.js` → recipes 171-249

2. Copy a similar recipe as a template

3. Update these fields:
   - `id`: next available number
   - `name`: recipe name
   - `category`: see `RECIPE_FORMAT.md`
   - `difficulty`: easy|medium|hard
   - `serves`, `time`, `calories`, `mainIngredient`
   - `ingredients`: array of ingredient objects
   - `steps`: array of step strings

4. Validate:
   ```bash
   node test-recipes.js
   ```

5. Commit:
   ```bash
   git add recipes.js
   git commit -m "Add [Recipe Name]"
   ```

## Common Commands

| Task | Command |
|------|---------|
| Validate recipes | `node test-recipes.js` |
| Check single file | `node -c recipes.js` |
| View format standards | See `RECIPE_FORMAT.md` |
| Get help | See `CONTRIBUTING.md` |
| Learn about prevention | See `PREVENTION_MEASURES.md` |

## If Something Goes Wrong

**Syntax error on commit?**
```bash
node -c recipes.js  # Find the exact line
# Fix the error, then try committing again
```

**Test failed?**
```bash
node test-recipes.js  # See detailed error
# Fix issues per error message
```

**Need help?**
- Check `CONTRIBUTING.md` troubleshooting section
- Review `RECIPE_FORMAT.md` for structure
- Look at existing recipes as examples

---

**That's it!** The validation systems handle the rest.

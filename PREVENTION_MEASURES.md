# Prevention Measures - Recipe Data Corruption

This document summarizes the measures put in place to prevent recipe file corruption (like the minified recipes4.js incident).

## What Happened

Recipe file `recipes4.js` became corrupted:
- Recipes 266-275 were minified into a single line
- This created a JavaScript syntax error
- The error prevented the entire file from loading
- The app showed no recipes until the file was disabled

## Prevention Strategy

A multi-layered approach prevents this from happening again:

### Layer 1: Pre-Commit Hook ⚙️
**File**: `.git/hooks/pre-commit`

Runs automatically before every commit:
- ✅ Validates JavaScript syntax with `node -c`
- ✅ Warns if files are minified (too few lines)
- ✅ Blocks commits with syntax errors
- ✅ Non-blocking for environments without Node.js

**How it works**: When you run `git commit`, the hook runs first. If it finds issues, the commit is blocked and you must fix them.

```bash
$ git commit -m "Add recipe"
🔍 Validating recipe files...
  Checking recipes.js...
  Checking recipes2.js...
✅ All recipe files valid
```

### Layer 2: Test Suite 🧪
**File**: `test-recipes.js`

Comprehensive validation that can be run manually or in CI:

```bash
node test-recipes.js
```

Tests:
1. **Syntax validation** - All files must have valid JavaScript
2. **Recipe loading** - All recipes must be loadable
3. **Duplicate ID detection** - No recipe can have the same ID
4. **Structure validation** - All recipes have required fields
5. **Category validation** - Categories are from approved list
6. **Difficulty validation** - Difficulty levels are valid

### Layer 3: Format Standards 📋
**File**: `RECIPE_FORMAT.md`

Defines the standards that must be followed:
- ✅ Required recipe object structure
- ✅ Formatting rules (2-space indentation, proper spacing)
- ✅ Never minify recipe files
- ✅ Valid categories and difficulty levels
- ✅ Examples and best practices

**Key rule**: Recipe files must be formatted and readable, never minified.

### Layer 4: CI/CD Pipeline 🤖
**File**: `.github/workflows/validate-recipes.yml`

GitHub Actions automatically validates on every push and pull request:
- Runs syntax checks on all recipe files
- Detects minification attempts
- Reports results on pull requests
- Blocks merging if tests fail

**Workflow**:
1. Developer pushes changes
2. GitHub Actions automatically runs tests
3. If tests pass → ✅ Green check on PR
4. If tests fail → ❌ Red X and PR cannot merge

### Layer 5: Documentation & Training 📚
**Files**: 
- `CONTRIBUTING.md` - Contributor guidelines
- `RECIPE_FORMAT.md` - Format standards
- `setup-dev.sh` - Developer setup script

**Coverage**:
- How to add recipes
- Common mistakes and how to fix them
- Setup instructions
- Validation workflow

## Workflow Before Committing

### For Local Development

1. **Setup once** (first time):
   ```bash
   chmod +x .git/hooks/pre-commit
   chmod +x setup-dev.sh
   ./setup-dev.sh
   ```

2. **Before each commit**:
   ```bash
   node test-recipes.js
   ```

3. **Commit** (pre-commit hook runs automatically):
   ```bash
   git add recipes.js
   git commit -m "Add new recipe"
   # Hook validates automatically
   ```

### For Pull Requests

1. Developer creates PR with recipe changes
2. GitHub Actions automatically runs all validation
3. Results appear as status check on PR
4. Must pass all tests to merge
5. Reviewer approves after validation passes

## What Gets Caught

This system prevents:

| Issue | Caught By |
|-------|-----------|
| Syntax errors | Pre-commit hook, Test suite, CI/CD |
| Minified code | Pre-commit hook (warning), CI/CD |
| Duplicate IDs | Test suite, CI/CD |
| Missing fields | Test suite, CI/CD |
| Invalid categories | Test suite, CI/CD |
| Invalid difficulty | Test suite, CI/CD |
| Malformed objects | Pre-commit hook, Test suite, CI/CD |
| Merge conflicts with duplicates | Test suite, CI/CD |

## Recovery Process

If an issue slips through:

1. **Caught locally**: Fix and recommit (pre-commit hook catches it)
2. **Caught in PR**: GitHub Actions shows error, fix in PR
3. **Already merged**: 
   - Create a new PR to fix it
   - CI/CD catches it before it gets to main
   - Revert + fix if necessary

## Maintenance

### Updating Standards

If you need to change recipe format:
1. Update `RECIPE_FORMAT.md`
2. Update validation in `test-recipes.js`
3. Update pre-commit hook if needed
4. Update GitHub Actions workflow
5. Document changes in `CONTRIBUTING.md`

### Adding New Categories

1. Add to valid list in `RECIPE_FORMAT.md`
2. Add to validation in `test-recipes.js`
3. Update GitHub Actions workflow
4. Create migration for existing recipes if needed

## Questions?

- **How to add recipes?** → See `RECIPE_FORMAT.md`
- **Got an error?** → Check `CONTRIBUTING.md` troubleshooting
- **Setting up?** → Run `./setup-dev.sh`
- **Need help?** → Review `CONTRIBUTING.md`

---

**Remember**: Keep recipe files formatted and readable. Never minify them. The validation system protects the data automatically.

#!/bin/bash
set -e

REPO_DIR="/Users/willcate/Documents/GitHub/WillsRecipes"
cd "$REPO_DIR"

# Clean up any stale git locks
echo "Cleaning git locks..."
find .git -name "*.lock" -type f -delete 2>/dev/null || true
sleep 1

# Duplicate gate: refuse to commit if the import re-added an existing recipe.
# (This is how ids 297-307 doubled up on 2026-07-09.)
echo "Checking for duplicate recipes..."
if command -v node >/dev/null 2>&1; then
  node scripts/validate.js || { echo "❌ Validation failed — not committing. Fix recipes.js first."; exit 1; }
else
  python3 - <<'PYEOF' || { echo "❌ Duplicate recipes found — not committing. Fix recipes.js first."; exit 1; }
import re, sys, collections
src = open('recipes.js').read()
heads = re.findall(r"^\{id:(\d+),name:'((?:[^'\\]|\\.)*)'", src, re.M)
ids = collections.Counter(int(i) for i, _ in heads)
names = collections.Counter(re.sub(r'[^a-z0-9]+', ' ', n.lower()).strip() for _, n in heads)
bad = [f"duplicate id {i}" for i, c in ids.items() if c > 1] + \
      [f"duplicate name '{n}'" for n, c in names.items() if c > 1]
for b in bad: print(b)
sys.exit(1 if bad else 0)
PYEOF
fi

# Try commit and push with retries
echo "Committing changes..."
git add recipes.js .recipe-sync-log.json 2>/dev/null || true

if git diff --cached --quiet; then
  echo "No changes to commit"
  exit 0
fi

MAX_ATTEMPTS=3
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  if git commit -m "Add new recipes from Apple Notes - $(date '+%Y-%m-%d')" 2>&1; then
    echo "Commit successful on attempt $ATTEMPT"
    break
  else
    echo "Commit failed on attempt $ATTEMPT, retrying..."
    find .git -name "*.lock" -type f -delete 2>/dev/null || true
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
  fi
done

if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
  echo "Failed to commit after $MAX_ATTEMPTS attempts"
  exit 1
fi

# Push
echo "Pushing to remote..."
git push

echo "✅ Recipe sync complete"

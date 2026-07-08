#!/bin/bash
set -e

REPO_DIR="/Users/willcate/Documents/GitHub/WillsRecipes"
cd "$REPO_DIR"

# Clean up any stale git locks
echo "Cleaning git locks..."
find .git -name "*.lock" -type f -delete 2>/dev/null || true
sleep 1

# Try commit and push with retries
echo "Committing changes..."
git add recipes4.js .recipe-sync-log.json 2>/dev/null || true

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

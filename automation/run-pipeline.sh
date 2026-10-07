#!/bin/zsh
# Runs the recipe pipeline headlessly for the nightly LaunchAgent.
# Wrapped with a hard timeout because this is unattended: if the agent ever
# reaches for an interactive tool (e.g. AskUserQuestion) there is no one to
# answer it, and a hung process would otherwise run forever.

set -uo pipefail

REPO_DIR="/Users/willcate/apps/WillsRecipes"
TIMEOUT_SECONDS=1800

cd "$REPO_DIR" || exit 1

echo "=== Recipe pipeline run started: $(date) ==="

/Users/willcate/.local/bin/claude -p \
  "Read automation/recipe-pipeline.md in this repo and execute it now as the scheduled nightly run. This is an unattended headless run with no one available to answer questions - the AskUserQuestion tool is disabled, so never rely on it. If a stage's outcome is ambiguous, make the safest reasonable judgment call rather than blocking - for example, if the tracking log and recipes.js appear inconsistent, cross-check recipe names against recipes.js before syncing anything so existing recipes are never duplicated, and note the discrepancy in the Stage 4 summary instead of guessing. Follow the brief exactly otherwise, including bumping the sw.js cache version in stage 3.6 whenever recipes.js changes, and committing/pushing at the end." \
  --permission-mode bypassPermissions \
  --disallowedTools AskUserQuestion \
  --model claude-sonnet-5 &

CLAUDE_PID=$!
ELAPSED=0

while kill -0 "$CLAUDE_PID" 2>/dev/null; do
  if [ "$ELAPSED" -ge "$TIMEOUT_SECONDS" ]; then
    echo "=== TIMEOUT after ${TIMEOUT_SECONDS}s - killing hung process $CLAUDE_PID: $(date) ==="
    kill -9 "$CLAUDE_PID" 2>/dev/null
    exit 124
  fi
  sleep 10
  ELAPSED=$((ELAPSED + 10))
done

wait "$CLAUDE_PID"
EXIT_CODE=$?
echo "=== Recipe pipeline run finished: $(date), exit code $EXIT_CODE ==="
exit $EXIT_CODE

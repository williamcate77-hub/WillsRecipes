#!/bin/bash
# Development environment setup script for Will's Recipes

echo "🚀 Setting up Will's Recipes development environment..."
echo ""

# Check Node.js
echo "📋 Checking Node.js..."
if ! command -v node &> /dev/null; then
  echo "  ❌ Node.js not found"
  echo "  Please install Node.js from https://nodejs.org/"
  exit 1
fi
NODE_VERSION=$(node --version)
echo "  ✅ Node.js $NODE_VERSION"

# Setup git hooks
echo ""
echo "🔧 Setting up git hooks..."

HOOK_FILE=".git/hooks/pre-commit"
if [ ! -f "$HOOK_FILE" ]; then
  echo "  ❌ Pre-commit hook not found"
  echo "  Creating hook..."
  cp "$HOOK_FILE" "$HOOK_FILE" 2>/dev/null || {
    echo "  ⚠️  Could not find template hook"
    echo "  See CONTRIBUTING.md for manual setup"
  }
fi

if [ -f "$HOOK_FILE" ]; then
  chmod +x "$HOOK_FILE"
  echo "  ✅ Pre-commit hook is executable"
fi

# Setup git config
echo ""
echo "⚙️  Configuring git settings..."
git config core.safecrlf true
echo "  ✅ Git line-ending safety enabled"

# Test recipe validation
echo ""
echo "🧪 Running recipe validation tests..."
if command -v node &> /dev/null; then
  if npm run validate; then
    echo "  ✅ All validation tests passed"
  else
    echo "  ❌ Some tests failed"
    echo "  Fix the issues shown above and run: npm run validate"
  fi
else
  echo "  ⚠️  Node.js not available, skipping tests"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Read these files for guidelines:"
echo "  - CONTRIBUTING.md - How to contribute"
echo "  - RECIPE_FORMAT.md - Recipe structure and standards"
echo ""
echo "🧪 Before committing, run:"
echo "  npm run validate"
echo ""
echo "💡 Tips:"
echo "  - Pre-commit hook runs automatically on 'git commit'"
echo "  - All recipe files are validated on push (GitHub Actions)"
echo "  - Keep recipe files formatted, never minify them"
echo ""

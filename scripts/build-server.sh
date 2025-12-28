#!/bin/bash
set -e

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Project root: $PROJECT_ROOT"
echo "Building SDK..."
cd "$PROJECT_ROOT/packages/sdk"
npm run build

echo "Building Server..."
cd "$PROJECT_ROOT/packages/server"
npm run build

echo "Build complete!"


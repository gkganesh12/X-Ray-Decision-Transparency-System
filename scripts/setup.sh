#!/bin/bash
# Setup script for X-Ray development environment

set -e

echo "Setting up X-Ray development environment..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build all packages
echo "Building packages..."
npm run build

# Create data directory
mkdir -p packages/server/data

echo "Setup complete!"
echo ""
echo "To start development:"
echo "  npm run dev        # Start server and dashboard"
echo "  npm run server     # Start server only"
echo "  npm run dashboard  # Start dashboard only"
echo "  npm run demo       # Run demo application"


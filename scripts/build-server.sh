#!/bin/bash
set -e

echo "Building SDK..."
cd packages/sdk
npm run build
cd ../..

echo "Building Server..."
cd packages/server
npm run build
cd ../..

echo "Build complete!"


#!/bin/bash
# frontend/build.sh

echo "🚀 Building Frontend for Production..."

# Install dependencies
npm install

# Build the app
npm run build

# Optimize build
npm run build -- --optimize

echo "✅ Frontend build complete!"
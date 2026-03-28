#!/bin/bash
# backend/build.sh

echo "🚀 Building Backend for Production..."

# Install dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p uploads temp

# Run database migrations if any
# python manage.py migrate

echo "✅ Backend build complete!"
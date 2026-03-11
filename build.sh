#!/bin/bash
set -e

echo "Building Angular..."
cd frontend && npx ng build

echo "Build complete. Files in backend/public/"

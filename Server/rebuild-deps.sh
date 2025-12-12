#!/bin/bash

echo "Cleaning and rebuilding Node.js dependencies..."

# Remove node_modules and package-lock.json
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
npm cache clean --force

# Install dependencies
npm install

# Verify critical modules
echo "Verifying Express installation..."
node -e "const express = require('express'); console.log('Express version:', require('express/package.json').version);"

echo "Setup complete!"
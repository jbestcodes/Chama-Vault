#!/bin/bash

echo "🧹 Chama Vault Server - Clean Deploy Script"
echo "=========================================="

# Set Node.js version if using nvm
if command -v nvm &> /dev/null; then
    echo "📦 Setting Node.js version..."
    nvm use 20.18.0 || nvm install 20.18.0
fi

echo "🗑️  Cleaning previous installation..."
rm -rf node_modules
rm -f package-lock.json
rm -f npm-debug.log*

echo "🧽 Clearing npm cache..."
npm cache clean --force

echo "📥 Installing dependencies..."
npm install --verbose --no-optional

echo "🔍 Verifying Express installation..."
if node -e "require('express'); console.log('Express OK')" 2>/dev/null; then
    echo "✅ Express verification passed"
else
    echo "❌ Express verification failed, reinstalling..."
    npm uninstall express
    npm install express@^4.19.2 --save
fi

echo "🧪 Running final verification..."
node -e "
const express = require('express');
const mongoose = require('mongoose');
console.log('✅ All modules load successfully');
console.log('📋 Express version:', require('express/package.json').version);
console.log('📋 Mongoose version:', require('mongoose/package.json').version);
"

echo "🎉 Clean deploy complete!"
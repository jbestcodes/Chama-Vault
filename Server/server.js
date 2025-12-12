// Startup verification and Express initialization
console.log('🚀 Starting Chama Vault server...');
console.log('📋 Node version:', process.version);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('⏰ Timestamp:', new Date().toISOString());

// Check Node.js version compatibility
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].slice(1));

if (majorVersion >= 25) {
    console.warn('⚠️  Warning: Node.js v25+ detected. This may cause compatibility issues.');
    console.warn('💡 Recommended: Use Node.js v18, v20, or v22 for better compatibility.');
}

// Verify critical modules before starting
try {
    console.log('🔍 Checking Express...');
    const express = require('express');
    console.log('✅ Express loaded successfully, version:', require('express/package.json').version);
    
    console.log('🔍 Checking Mongoose...');
    const mongoose = require('mongoose');
    console.log('✅ Mongoose loaded successfully, version:', require('mongoose/package.json').version);
    
    console.log('🔍 Checking other core dependencies...');
    require('cors');
    require('jsonwebtoken');
    require('bcryptjs');
    require('dotenv');
    console.log('✅ All core dependencies loaded successfully');
    
    console.log('🚀 All dependencies verified, starting main server...');
    
    // Start the main server
    require('./index');
    
} catch (error) {
    console.error('❌ Fatal error during startup:');
    console.error('🔥 Error:', error.message);
    console.error('📍 Stack:', error.stack);
    
    if (error.code === 'MODULE_NOT_FOUND') {
        console.error('');
        console.error('🔧 Possible solutions:');
        console.error('1. Run: npm install --force');
        console.error('2. Run: npm rebuild');
        console.error('3. Delete node_modules and run: npm ci');
        console.error('4. Check Node.js version compatibility (recommended: v18-v22)');
        console.error('5. Update Express: npm install express@latest');
        console.error('');
        console.error('🐛 Debug info:');
        console.error('   - Current working directory:', process.cwd());
        console.error('   - Node.js version:', process.version);
        console.error('   - Platform:', process.platform);
        console.error('   - Architecture:', process.arch);
    }
    
    process.exit(1);
}
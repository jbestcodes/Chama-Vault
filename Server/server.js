// Startup verification and Express initialization
console.log('Starting Chama Vault server...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');

// Verify critical modules before starting
try {
    console.log('Checking Express...');
    const express = require('express');
    console.log('✓ Express loaded successfully');
    
    console.log('Checking Mongoose...');
    const mongoose = require('mongoose');
    console.log('✓ Mongoose loaded successfully');
    
    console.log('Checking other dependencies...');
    require('cors');
    require('jsonwebtoken');
    require('bcryptjs');
    console.log('✓ Core dependencies loaded successfully');
    
    // Start the main server
    require('./index');
    
} catch (error) {
    console.error('❌ Fatal error during startup:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.code === 'MODULE_NOT_FOUND') {
        console.error('');
        console.error('🔧 Possible solutions:');
        console.error('1. Run: npm install');
        console.error('2. Delete node_modules and run: npm ci');
        console.error('3. Check if package.json dependencies are correct');
        console.error('4. Verify Node.js version compatibility');
    }
    
    process.exit(1);
}
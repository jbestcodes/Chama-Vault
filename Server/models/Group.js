const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    group_name: { 
        type: String, 
        required: true, 
        unique: true,  // MongoDB unique constraint
        trim: true,    // Removes leading/trailing spaces
        lowercase: true // Automatically converts to lowercase
    },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    interest_rate: { type: Number, default: 5.0 },
    minimum_loan_savings: { type: Number, default: 500.00 },
    group_code: { type: String, unique: true },
    created_at: { type: Date, default: Date.now }
});

// Create compound index for better performance
groupSchema.index({ group_name: 1, admin_id: 1 });

module.exports = mongoose.model('Group', groupSchema);
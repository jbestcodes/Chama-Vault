const mongoose = require('mongoose');

const tableBankingCycleSchema = new mongoose.Schema({
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    cycle_number: { type: Number, required: true }, // 1st cycle, 2nd cycle, etc.
    
    // Cycle Configuration
    contribution_amount: { type: Number, required: true }, // Amount each member contributes
    frequency: { type: String, enum: ['weekly', 'monthly'], required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date }, // Calculated when cycle completes
    
    // Member rotation order
    member_order: [{
        member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
        position: { type: Number, required: true }, // 1, 2, 3... order of receiving money
        payout_date: { type: Date }, // When this member receives the money
        has_received: { type: Boolean, default: false },
        amount_received: { type: Number, default: 0 }
    }],
    
    // Cycle status
    status: { 
        type: String, 
        enum: ['active', 'completed', 'paused'], 
        default: 'active' 
    },
    current_recipient_position: { type: Number, default: 1 }, // Who's turn is it now
    
    // Financial tracking
    total_expected_per_round: { type: Number }, // contribution_amount * number_of_members
    emergency_fund_percentage: { type: Number, default: 0 }, // % kept for emergencies
    
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Update the updated_at field before saving
tableBankingCycleSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

// Create indexes for performance
tableBankingCycleSchema.index({ group_id: 1, cycle_number: 1 });
tableBankingCycleSchema.index({ group_id: 1, status: 1 });

module.exports = mongoose.model('TableBankingCycle', tableBankingCycleSchema);
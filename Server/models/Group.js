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
    
    // Contribution Schedule Settings
    contribution_settings: {
        amount: { type: Number, default: 1000 }, // Monthly contribution amount
        frequency: { type: String, enum: ['weekly', 'monthly'], default: 'monthly' },
        due_day: { type: Number, default: 1 }, // Day of month (1-31) for monthly, day of week (1-7) for weekly
        reminder_days_before: { type: Number, default: 3 }, // Days before due date to send reminder
        penalty_amount: { type: Number, default: 50 }, // Late payment penalty
        grace_period_days: { type: Number, default: 5 }, // Grace period before penalty
        auto_reminders: { type: Boolean, default: true }
    },
    
    // SMS Settings for the group
    sms_settings: {
        enabled: { type: Boolean, default: true },
        account_approvals: { type: Boolean, default: true },
        loan_updates: { type: Boolean, default: true },
        contribution_reminders: { type: Boolean, default: true },
        repayment_reminders: { type: Boolean, default: true }
    },
    
    created_at: { type: Date, default: Date.now }
});

// Create compound index for better performance
groupSchema.index({ group_name: 1, admin_id: 1 });

module.exports = mongoose.model('Group', groupSchema);
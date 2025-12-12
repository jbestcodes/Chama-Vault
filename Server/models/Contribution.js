const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    cycle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TableBankingCycle', required: true },
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    
    // Contribution details
    expected_amount: { type: Number, required: true },
    paid_amount: { type: Number, default: 0 },
    due_date: { type: Date, required: true },
    paid_date: { type: Date },
    
    // Payment status
    status: { 
        type: String, 
        enum: ['pending', 'paid', 'late', 'partially_paid'], 
        default: 'pending' 
    },
    
    // Performance tracking
    days_late: { type: Number, default: 0 }, // How many days late the payment was
    penalty_applied: { type: Number, default: 0 }, // Penalty amount if any
    
    // Admin notes
    notes: { type: String }, // Admin can add notes about the contribution
    recorded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }, // Admin who recorded the payment
    
    // Timestamps
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Update the updated_at field before saving
contributionSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    
    // Calculate days late if payment is made
    if (this.paid_date && this.due_date) {
        const timeDiff = this.paid_date.getTime() - this.due_date.getTime();
        this.days_late = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    }
    
    // Update status based on payment
    if (this.paid_amount >= this.expected_amount) {
        this.status = this.days_late > 0 ? 'late' : 'paid';
    } else if (this.paid_amount > 0) {
        this.status = 'partially_paid';
    }
    
    next();
});

// Create indexes for performance
contributionSchema.index({ group_id: 1, cycle_id: 1 });
contributionSchema.index({ member_id: 1, due_date: 1 });
contributionSchema.index({ status: 1, due_date: 1 });

// Method to calculate member payment performance
contributionSchema.statics.getMemberPerformance = async function(memberId, groupId) {
    const contributions = await this.find({ 
        member_id: memberId, 
        group_id: groupId,
        status: { $in: ['paid', 'late'] }
    });
    
    if (contributions.length === 0) {
        return { rating: 'new', color: 'gray', percentage: 0 };
    }
    
    const onTimePayments = contributions.filter(c => c.status === 'paid' && c.days_late === 0).length;
    const latePayments = contributions.filter(c => c.days_late > 0).length;
    const total = contributions.length;
    
    const onTimePercentage = (onTimePayments / total) * 100;
    
    let rating, color;
    if (onTimePercentage >= 80) {
        rating = 'excellent';
        color = 'green';
    } else if (onTimePercentage >= 60) {
        rating = 'good';
        color = 'orange';
    } else {
        rating = 'poor';
        color = 'red';
    }
    
    return {
        rating,
        color,
        percentage: onTimePercentage,
        onTimePayments,
        latePayments,
        total
    };
};

module.exports = mongoose.model('Contribution', contributionSchema);
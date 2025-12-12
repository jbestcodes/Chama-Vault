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
    
    // Admin timing rating (new feature)
    timing_rating: { 
        type: String, 
        enum: ['early', 'on_time', 'late', 'not_rated'], 
        default: 'not_rated' 
    },
    rating_date: { type: Date }, // When admin rated the contribution
    rating_notes: { type: String }, // Admin notes about the rating
    rated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }, // Admin who rated
    
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

// Method to get timing rating analytics for a group
contributionSchema.statics.getTimingAnalytics = async function(groupId, cycleId = null) {
    const query = { group_id: groupId };
    if (cycleId) query.cycle_id = cycleId;
    
    const contributions = await this.find(query).populate('member_id', 'first_name last_name');
    
    // Overall timing statistics
    const totalRated = contributions.filter(c => c.timing_rating !== 'not_rated').length;
    const early = contributions.filter(c => c.timing_rating === 'early').length;
    const onTime = contributions.filter(c => c.timing_rating === 'on_time').length;
    const late = contributions.filter(c => c.timing_rating === 'late').length;
    
    const analytics = {
        total_contributions: contributions.length,
        total_rated: totalRated,
        ratings: {
            early: { count: early, percentage: totalRated > 0 ? (early / totalRated) * 100 : 0 },
            on_time: { count: onTime, percentage: totalRated > 0 ? (onTime / totalRated) * 100 : 0 },
            late: { count: late, percentage: totalRated > 0 ? (late / totalRated) * 100 : 0 },
            not_rated: { count: contributions.length - totalRated }
        },
        // Member-wise breakdown
        member_breakdown: {}
    };
    
    // Calculate per-member analytics
    const memberStats = {};
    contributions.forEach(contribution => {
        const memberId = contribution.member_id._id.toString();
        if (!memberStats[memberId]) {
            memberStats[memberId] = {
                name: `${contribution.member_id.first_name} ${contribution.member_id.last_name}`,
                early: 0,
                on_time: 0,
                late: 0,
                not_rated: 0,
                total: 0
            };
        }
        memberStats[memberId][contribution.timing_rating]++;
        memberStats[memberId].total++;
    });
    
    analytics.member_breakdown = memberStats;
    return analytics;
};

// Method to get member timing performance
contributionSchema.statics.getMemberTimingPerformance = async function(memberId, groupId) {
    const contributions = await this.find({ 
        member_id: memberId, 
        group_id: groupId,
        timing_rating: { $ne: 'not_rated' }
    });
    
    if (contributions.length === 0) {
        return { 
            average_rating: 'no_data', 
            total_rated: 0,
            breakdown: { early: 0, on_time: 0, late: 0 }
        };
    }
    
    const early = contributions.filter(c => c.timing_rating === 'early').length;
    const onTime = contributions.filter(c => c.timing_rating === 'on_time').length;
    const late = contributions.filter(c => c.timing_rating === 'late').length;
    
    // Calculate weighted average (early=3, on_time=2, late=1)
    const totalWeight = (early * 3) + (onTime * 2) + (late * 1);
    const averageScore = totalWeight / contributions.length;
    
    let average_rating;
    if (averageScore >= 2.5) average_rating = 'excellent';
    else if (averageScore >= 2.0) average_rating = 'good';
    else if (averageScore >= 1.5) average_rating = 'fair';
    else average_rating = 'poor';
    
    return {
        average_rating,
        total_rated: contributions.length,
        breakdown: { early, on_time: onTime, late },
        score: averageScore
    };
};

module.exports = mongoose.model('Contribution', contributionSchema);
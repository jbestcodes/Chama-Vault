const mongoose = require('mongoose');

const LoanRepaymentSchema = new mongoose.Schema({
  loan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  amount: { type: Number, required: true },
  paid_date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  confirmed_at: { type: Date },
  
  // Expected due date for this repayment (from loan schedule)
  expected_due_date: { type: Date },
  
  // Performance tracking
  days_late: { type: Number, default: 0 }, // How many days late the payment was
  
  // Admin timing rating (new feature)
  timing_rating: { 
    type: String, 
    enum: ['early', 'on_time', 'late', 'not_rated'], 
    default: 'not_rated' 
  },
  rating_date: { type: Date }, // When admin rated the repayment
  rating_notes: { type: String }, // Admin notes about the rating
  rated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }, // Admin who rated
  
  createdAt: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at field before saving
LoanRepaymentSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  
  // Calculate days late if expected_due_date is set
  if (this.paid_date && this.expected_due_date) {
    const timeDiff = this.paid_date.getTime() - this.expected_due_date.getTime();
    this.days_late = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  }
  
  next();
});

// Create indexes for performance
LoanRepaymentSchema.index({ loan_id: 1, paid_date: 1 });
LoanRepaymentSchema.index({ timing_rating: 1 });

// Static method to get loan timing analytics for a member or group
LoanRepaymentSchema.statics.getLoanTimingAnalytics = async function(query = {}) {
  const repayments = await this.find(query).populate({
    path: 'loan_id',
    populate: {
      path: 'member_id',
      select: 'first_name last_name group_id'
    }
  });
  
  // Overall timing statistics
  const totalRated = repayments.filter(r => r.timing_rating !== 'not_rated').length;
  const early = repayments.filter(r => r.timing_rating === 'early').length;
  const onTime = repayments.filter(r => r.timing_rating === 'on_time').length;
  const late = repayments.filter(r => r.timing_rating === 'late').length;
  
  const analytics = {
    total_repayments: repayments.length,
    total_rated: totalRated,
    ratings: {
      early: { count: early, percentage: totalRated > 0 ? (early / totalRated) * 100 : 0 },
      on_time: { count: onTime, percentage: totalRated > 0 ? (onTime / totalRated) * 100 : 0 },
      late: { count: late, percentage: totalRated > 0 ? (late / totalRated) * 100 : 0 },
      not_rated: { count: repayments.length - totalRated }
    },
    // Average days late
    average_days_late: repayments.length > 0 ? 
      repayments.reduce((sum, r) => sum + (r.days_late || 0), 0) / repayments.length : 0
  };
  
  return analytics;
};

// Static method to get member loan repayment performance
LoanRepaymentSchema.statics.getMemberLoanPerformance = async function(memberId) {
  const repayments = await this.find().populate({
    path: 'loan_id',
    match: { member_id: memberId },
    select: 'member_id'
  });
  
  // Filter out repayments where loan_id didn't match (due to populate)
  const memberRepayments = repayments.filter(r => r.loan_id);
  
  if (memberRepayments.length === 0) {
    return { 
      average_rating: 'no_data', 
      total_rated: 0,
      breakdown: { early: 0, on_time: 0, late: 0 },
      average_days_late: 0
    };
  }
  
  const ratedRepayments = memberRepayments.filter(r => r.timing_rating !== 'not_rated');
  
  if (ratedRepayments.length === 0) {
    return { 
      average_rating: 'no_data', 
      total_rated: 0,
      breakdown: { early: 0, on_time: 0, late: 0 },
      average_days_late: memberRepayments.reduce((sum, r) => sum + (r.days_late || 0), 0) / memberRepayments.length
    };
  }
  
  const early = ratedRepayments.filter(r => r.timing_rating === 'early').length;
  const onTime = ratedRepayments.filter(r => r.timing_rating === 'on_time').length;
  const late = ratedRepayments.filter(r => r.timing_rating === 'late').length;
  
  // Calculate weighted average (early=3, on_time=2, late=1)
  const totalWeight = (early * 3) + (onTime * 2) + (late * 1);
  const averageScore = totalWeight / ratedRepayments.length;
  
  let average_rating;
  if (averageScore >= 2.5) average_rating = 'excellent';
  else if (averageScore >= 2.0) average_rating = 'good';
  else if (averageScore >= 1.5) average_rating = 'fair';
  else average_rating = 'poor';
  
  return {
    average_rating,
    total_rated: ratedRepayments.length,
    breakdown: { early, on_time: onTime, late },
    score: averageScore,
    average_days_late: memberRepayments.reduce((sum, r) => sum + (r.days_late || 0), 0) / memberRepayments.length
  };
};

module.exports = mongoose.model('LoanRepayment', LoanRepaymentSchema);
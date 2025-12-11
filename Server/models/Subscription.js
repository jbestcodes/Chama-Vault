const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, unique: true },
  plan_type: { type: String, enum: ['monthly', 'weekly'], default: 'monthly' },
  status: { type: String, enum: ['active', 'inactive', 'cancelled', 'suspended'], default: 'inactive' },
  
  // Paystack details
  subscription_code: { type: String },
  customer_code: { type: String },
  authorization_url: { type: String },
  
  // Payment details
  amount: { type: Number, required: true },
  currency: { type: String, default: 'KES' },
  interval: { type: String, enum: ['monthly', 'weekly'], default: 'monthly' },
  
  // Subscription dates
  start_date: { type: Date },
  next_payment_date: { type: Date },
  expires_at: { type: Date },
  cancelled_at: { type: Date },
  
  // Features enabled for this member
  features: {
    sms_notifications: { type: Boolean, default: false },
    ai_access: { type: Boolean, default: false },
    loan_notifications: { type: Boolean, default: false },
    contribution_reminders: { type: Boolean, default: false },
    group_invites: { type: Boolean, default: false }
  },
  
  // Usage tracking
  usage: {
    sms_sent_this_month: { type: Number, default: 0 },
    ai_requests_this_month: { type: Number, default: 0 },
    last_usage_reset: { type: Date, default: Date.now }
  },
  
  // Payment history
  payments: [{
    reference: String,
    amount: Number,
    status: String,
    paid_at: Date,
    created_at: { type: Date, default: Date.now }
  }],
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at field before saving
SubscriptionSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Method check if subscription is active
SubscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && new Date() < this.expires_at;
};

// Method to check feature availability
SubscriptionSchema.methods.hasFeature = function(feature) {
  return this.features[feature] === true;
};

// Method to check if member can access AI
SubscriptionSchema.methods.canAccessAI = function() {
  return this.isActive() && this.features.ai_access;
};

// Method to check if member can receive SMS notifications
SubscriptionSchema.methods.canReceiveSMS = function() {
  return this.isActive() && this.features.sms_notifications;
};

// Static method to get subscription by member
SubscriptionSchema.statics.getByMember = function(memberId) {
  return this.findOne({ member_id: memberId });
};

module.exports = mongoose.model('Subscription', SubscriptionSchema);
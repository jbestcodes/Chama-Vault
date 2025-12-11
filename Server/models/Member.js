const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String }, 
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  group_name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  is_admin: { type: Boolean, default: false },
  
  // Phone verification and OTP
  phone_verified: { type: Boolean, default: false },
  verification_otp: { type: String },
  otp_expires: { type: Date },
  login_otp: { type: String },
  login_otp_expires: { type: Date },
  
  // SMS Preferences
  sms_notifications: {
    account_updates: { type: Boolean, default: true },
    loan_updates: { type: Boolean, default: true },
    contribution_reminders: { type: Boolean, default: true },
    repayment_reminders: { type: Boolean, default: true }
  },
  
  // Subscription status (quick reference)
  has_active_subscription: { type: Boolean, default: false },
  subscription_plan: { type: String, enum: ['monthly', 'weekly', null], default: null },
  subscription_expires: { type: Date },
  
  createdAt: { type: Date, default: Date.now }
});

// Auto-approve admins before saving
MemberSchema.pre('save', function(next) {
  if (this.role === 'admin') {
    this.status = 'approved';
    this.is_admin = true;
  }
  next();
});

module.exports = mongoose.model('Member', MemberSchema);
const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true }, // Email for authentication
  password: { type: String }, 
  // Multiple group memberships support
  group_memberships: [{
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    group_name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
    is_admin: { type: Boolean, default: false },
    joined_at: { type: Date, default: Date.now }
  }],
  
  // Backwards compatibility fields (will be deprecated)
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  group_name: { type: String },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  is_admin: { type: Boolean, default: false },
  
  // Email verification
  email_verified: { type: Boolean, default: false },
  email_verification_code: { type: String },
  email_verification_expires: { type: Date },
  
  // Phone verification and OTP
  phone_verified: { type: Boolean, default: false },
  verification_otp: { type: String },
  otp_expires: { type: Date },
  login_otp: { type: String },
  login_otp_expires: { type: Date },
  
  // OTP rate limiting (max 3 requests per hour)
  otp_requests: [{
    timestamp: { type: Date },
    type: { type: String, enum: ['login', 'verification', 'password_reset'] }
  }],
  
  // SMS Preferences
  sms_notifications: {
    account_updates: { type: Boolean, default: true },
    loan_updates: { type: Boolean, default: true },
    contribution_reminders: { type: Boolean, default: true },
    repayment_reminders: { type: Boolean, default: true }
  },

  // Notification schedule (when member wants reminders sent)
  notification_schedule: {
    // day can be 'any' or weekday name (e.g., 'monday')
    day: { type: String, default: 'any' },
    // preferred time in HH:MM 24h format
    time: { type: String, default: '09:00' },
    // method can be 'sms', 'email', or 'both'
    method: { type: String, enum: ['sms', 'email', 'both'], default: 'sms' }
  },
  
  // Subscription status (quick reference)
  has_active_subscription: { type: Boolean, default: false },
  subscription_plan: { type: String, enum: ['monthly', 'weekly', null], default: null },
  subscription_expires: { type: Date },
  
  createdAt: { type: Date, default: Date.now }
});

// Auto-approve admins before saving
MemberSchema.pre('save', function(next) {
  // Handle backwards compatibility
  if (this.role === 'admin') {
    this.status = 'approved';
    this.is_admin = true;
  }
  
  // Handle group memberships
  if (this.group_memberships && this.group_memberships.length > 0) {
    this.group_memberships.forEach(membership => {
      if (membership.role === 'admin') {
        membership.status = 'approved';
        membership.is_admin = true;
      }
    });
    
    // Update global is_admin flag if user is admin in any group
    this.is_admin = this.group_memberships.some(membership => membership.role === 'admin');
  }
  
  next();
});

// Helper method to add group membership
MemberSchema.methods.addGroupMembership = function(groupData) {
  const existingMembership = this.group_memberships.find(
    membership => membership.group_id.toString() === groupData.group_id.toString()
  );
  
  if (!existingMembership) {
    this.group_memberships.push({
      group_id: groupData.group_id,
      group_name: groupData.group_name,
      role: groupData.role || 'member',
      status: groupData.role === 'admin' ? 'approved' : 'pending'
    });
  }
  
  return this;
};

// Helper method to get role in specific group
MemberSchema.methods.getRoleInGroup = function(groupId) {
  const membership = this.group_memberships.find(
    membership => membership.group_id.toString() === groupId.toString()
  );
  return membership ? membership.role : null;
};

// Helper method to check if member is admin in any group
MemberSchema.methods.isAdminInAnyGroup = function() {
  return this.group_memberships.some(membership => membership.role === 'admin');
};

module.exports = mongoose.model('Member', MemberSchema);
const mongoose = require('mongoose');

const SavingsSchema = new mongoose.Schema({
  member_id: { type: mongoose.Schema.Types.Mixed, required: true }, // Allow both ObjectId and string for non-members
  week_number: { type: Number, required: true },
  amount: { type: Number, required: true },
  member_name: { type: String }, // For non-members who don't have accounts
  is_non_member: { type: Boolean, default: false }, // Flag to identify non-member savings
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // For non-member tracking  non_member_phone: { type: String }, // Phone for future matching
  non_member_email: { type: String }, // Email for future matching
  matched_member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }, // If matched later
  matched_at: { type: Date }, // When matching occurred  createdAt: { type: Date, default: Date.now }
});

// Ensure one savings entry per member per week
SavingsSchema.index({ member_id: 1, week_number: 1 }, { unique: true });

module.exports = mongoose.model('Savings', SavingsSchema);
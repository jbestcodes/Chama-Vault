const mongoose = require('mongoose');

const WithdrawalRequestSchema = new mongoose.Schema({
  member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  request_type: { type: String, enum: ['quit_group', 'loan_payment', 'emergency'], required: true },
  loan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  admin_notes: { type: String },
  processed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);
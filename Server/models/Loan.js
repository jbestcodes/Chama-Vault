const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount: { type: Number, required: true },
  interest_rate: { type: Number },
  fees: { type: Number, default: 0 },
  due_date: { type: Date },
  last_due_date: { type: Date },
  total_due: { type: Number },
  installment_number: { type: Number },
  installment_amount: { type: Number },
  status: { type: String, enum: ['requested', 'offered', 'active', 'rejected', 'completed'], default: 'requested' },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Loan', LoanSchema);
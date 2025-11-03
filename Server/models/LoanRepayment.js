const mongoose = require('mongoose');

const LoanRepaymentSchema = new mongoose.Schema({
  loan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  amount: { type: Number, required: true },
  paid_date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  confirmed_at: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoanRepayment', LoanRepaymentSchema);
const mongoose = require('mongoose');

const SavingsSchema = new mongoose.Schema({
  member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  week_number: { type: Number, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Ensure one savings entry per member per week
SavingsSchema.index({ member_id: 1, week_number: 1 }, { unique: true });

module.exports = mongoose.model('Savings', SavingsSchema);
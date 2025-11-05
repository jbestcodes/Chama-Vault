const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  group_name: { type: String, required: true, unique: true },
  admin_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  interest_rate: { type: Number, default: 5.0 },
  minimum_loan_savings: { type: Number, default: 500.00 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);
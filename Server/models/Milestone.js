const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  milestone_name: { type: String, required: true },
  target_amount: { type: Number, required: true },
  target_date: { type: Date }, // Deadline for the milestone
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Milestone', MilestoneSchema);
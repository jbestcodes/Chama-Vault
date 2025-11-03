const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  group_name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);
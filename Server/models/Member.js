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
// Create models/Invitation.js
const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    recipient_name: { type: String, required: true },
    email: { type: String, required: true },
    invite_code: { type: String, required: true, unique: true },
    phone: { type: String }, // Optional, for backward compatibility
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    invited_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'cancelled', 'expired'], default: 'pending' },
    expires_at: { type: Date, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invitation', invitationSchema);
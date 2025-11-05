// Create models/Invitation.js
const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    group_name: { type: String, required: true },
    invited_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
    expires_at: { type: Date, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invitation', invitationSchema);
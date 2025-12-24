const mongoose = require('mongoose');

const StatementRequestSchema = new mongoose.Schema({
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    request_date: { type: Date, default: Date.now },
    payment_status: { 
        type: String, 
        enum: ['pending', 'paid', 'failed', 'sent'], 
        default: 'pending' 
    },
    payment_reference: { type: String },
    amount: { type: Number, default: 10.00 }, // KSh 10
    statement_sent_at: { type: Date },
    email_sent_to: { type: String },
    statement_period_start: { type: Date },
    statement_period_end: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StatementRequest', StatementRequestSchema);

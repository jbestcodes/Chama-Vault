const mongoose = require('mongoose');

const groupRuleSchema = new mongoose.Schema({
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    
    // Rule categorization
    category: { 
        type: String, 
        enum: [
            'membership',      // Member requirements, joining process
            'contributions',   // Payment rules, deadlines
            'loans',          // Loan policies beyond basic rates
            'meetings',       // Meeting rules and procedures
            'table_banking',  // Merry-go-round specific rules
            'penalties',      // Fines and penalty policies
            'withdrawals',    // Withdrawal conditions and limits
            'governance',     // Leadership and decision making
            'general'         // Other general rules
        ],
        required: true 
    },
    
    // Rule content
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    
    // Rule status and priority
    is_active: { type: Boolean, default: true },
    priority: { type: Number, default: 0 }, // Higher number = higher priority
    
    // Rule enforcement
    enforcement_level: {
        type: String,
        enum: ['guideline', 'rule', 'strict_policy'], // How strictly enforced
        default: 'rule'
    },
    
    // Penalty information (if applicable)
    has_penalty: { type: Boolean, default: false },
    penalty_amount: { type: Number }, // Fixed penalty amount
    penalty_percentage: { type: Number }, // Percentage-based penalty
    penalty_description: { type: String, maxlength: 500 },
    
    // AI integration flags
    include_in_ai_responses: { type: Boolean, default: true }, // Should AI mention this rule
    ai_keywords: [{ type: String }], // Keywords to help AI match relevant rules
    
    // Admin information
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    
    // Approval workflow (optional)
    requires_approval: { type: Boolean, default: false },
    approval_status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'approved' 
    },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    approval_date: { type: Date },
    
    // Usage tracking
    times_referenced: { type: Number, default: 0 }, // How often AI has referenced this rule
    last_referenced: { type: Date },
    
    // Timestamps
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Update the updated_at field before saving
groupRuleSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    
    // Auto-generate AI keywords from title and description if not provided
    if (!this.ai_keywords || this.ai_keywords.length === 0) {
        const text = `${this.title} ${this.description}`.toLowerCase();
        const keywords = [];
        
        // Extract relevant keywords based on category
        const categoryKeywords = {
            'membership': ['member', 'join', 'registration', 'requirements'],
            'contributions': ['payment', 'contribution', 'deadline', 'amount'],
            'loans': ['loan', 'borrow', 'interest', 'repayment'],
            'meetings': ['meeting', 'attendance', 'agenda', 'quorum'],
            'table_banking': ['table banking', 'merry-go-round', 'rotation', 'cycle'],
            'penalties': ['penalty', 'fine', 'late', 'violation'],
            'withdrawals': ['withdrawal', 'cash out', 'savings'],
            'governance': ['leadership', 'voting', 'decision', 'admin'],
            'general': ['policy', 'procedure', 'rule']
        };
        
        // Add category-specific keywords
        if (categoryKeywords[this.category]) {
            keywords.push(...categoryKeywords[this.category]);
        }
        
        // Extract words from title (3+ characters)
        const titleWords = this.title.toLowerCase().match(/\b\w{3,}\b/g) || [];
        keywords.push(...titleWords);
        
        // Remove duplicates and store
        this.ai_keywords = [...new Set(keywords)];
    }
    
    next();
});

// Create indexes for performance
groupRuleSchema.index({ group_id: 1, category: 1 });
groupRuleSchema.index({ group_id: 1, is_active: 1, include_in_ai_responses: 1 });
groupRuleSchema.index({ ai_keywords: 1 });
groupRuleSchema.index({ priority: -1, created_at: -1 });

// Method to get rules for AI context
groupRuleSchema.statics.getAIRules = async function(groupId, keywords = [], category = null) {
    const query = {
        group_id: groupId,
        is_active: true,
        include_in_ai_responses: true,
        approval_status: 'approved'
    };
    
    if (category) {
        query.category = category;
    }
    
    let rules = await this.find(query)
        .select('title description category priority penalty_description ai_keywords')
        .sort({ priority: -1, created_at: -1 });
    
    // If keywords provided, score and filter rules by relevance
    if (keywords && keywords.length > 0) {
        rules = rules.map(rule => {
            const ruleKeywords = rule.ai_keywords || [];
            const matches = keywords.filter(keyword => 
                ruleKeywords.some(ruleKeyword => 
                    ruleKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
                    keyword.toLowerCase().includes(ruleKeyword.toLowerCase())
                )
            );
            
            return {
                ...rule.toObject(),
                relevance_score: matches.length + (rule.priority || 0),
                matched_keywords: matches
            };
        }).filter(rule => rule.relevance_score > 0)
          .sort((a, b) => b.relevance_score - a.relevance_score);
    }
    
    return rules;
};

// Method to increment reference counter
groupRuleSchema.methods.markReferenced = async function() {
    this.times_referenced = (this.times_referenced || 0) + 1;
    this.last_referenced = new Date();
    await this.save();
};

// Method to get rule summary for AI
groupRuleSchema.methods.getAISummary = function() {
    let summary = `${this.title}: ${this.description}`;
    
    if (this.has_penalty && (this.penalty_amount || this.penalty_percentage || this.penalty_description)) {
        summary += ` [Penalty: `;
        if (this.penalty_amount) summary += `KSh ${this.penalty_amount}`;
        if (this.penalty_percentage) summary += `${this.penalty_percentage}%`;
        if (this.penalty_description) summary += `${this.penalty_description}`;
        summary += `]`;
    }
    
    return summary;
};

module.exports = mongoose.model('GroupRule', groupRuleSchema);